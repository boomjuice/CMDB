from django.shortcuts import render, HttpResponse
from django.views import View
from app01.models import *
import json
from static import Pager


class AssetView(View):
    def get(self, request, *args, **kwargs):
        return render(request, 'asset.html')


class AssetJsonView(View):
    """
     无@符号 代表不做任何改变在前端表示
     一个@符号 代表将@符号后面的东西传到前端进行字符串格式，表示去数据库取某一行某一列的值
     两个@符号 则代表将model里的choices选项传到前端，进行全局变量定义
    """
    def get(self, request, *args, **kwargs):
        table_config = [
            {
                'q': None,
                'title': '选项',
                'display': True,
                'text': {'content': '<input type="checkbox">', 'kwargs': {}},
                'attrs': {}
            },
            {
                'q': 'id',
                'title': 'ID',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': "@id"}},
                'attrs': {}
            },
            {
                'q': 'device_type_id',
                'title': '资产类型',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': "@@device_type_choices"}},
                'attrs': {'origin': '@device_type_id','edit-enable': "true", 'edit-type': 'select',
                          'global-name': 'device_type_choices', 'name': 'device_type_id'}
            },
            {
                'q': 'device_status_id',
                'title': '状态',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': "@@device_status_choices"}},
                'attrs': {'origin': '@device_status_id','edit-enable': "true", 'edit-type': 'select',
                          'global-name': 'device_status_choices', 'name': 'device_status_id'}
            },
            {
                'q': 'idc__name',
                'title': 'IDC',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': "@idc__name"}},
                'attrs': {'origin': '@idc__id','edit-enable': "true", 'edit-type': 'select',
                          'global-name': 'idc_choices', 'name': 'idc__id'}
            },
            {
                'q': 'idc__id',
                'title': 'IDC',
                'display': False,
                'text': {},
                'attrs': {},
            },
            {
                'q': 'cabinet_num',
                'title': '机柜号',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': "@cabinet_num"}},
                'attrs': {}
            },
            {
                'q': 'cabinet_order',
                'title': '机柜中序号',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': "@cabinet_order"}},
                'attrs': {'origin': '@cabinet_order', 'edit-enable': "true", 'edit-type': 'input', 'name': 'cabinet_order'}
            },
            {
                'q': None,
                'title': '操作',
                'display': True,
                'text': {'content': '<a href="/assetdetail-{m}">{n}</a>', 'kwargs': {'n': "查看详情", 'm': '@id'}},
                'attrs': {}
            },
        ]
        q_list = []
        for item in table_config:
            if not item['q']:
                continue
            q_list.append(item['q'])

        data_list = list(Asset.objects.all().values(*q_list))
        data_count = Asset.objects.all().count()
        pagination = Pager.Pagination(data_count,request.GET.get('paper'),2,7)
        data_list = data_list[pagination.start():pagination.end()]
        num_pages = pagination.num_pages
        page_str = pagination.page_str()
        context = {
            'table_config': table_config,
            'data_list': data_list,
            'global_dict': {
                'device_type_choices': Asset.device_type_choices,
                'device_status_choices': Asset.device_status_choices,
                'idc_choices': list(IDC.objects.values_list('id', 'name')),
                'num_pages': num_pages,
            },
            'paper': page_str,
        }
        return HttpResponse(json.dumps(context))

    def put(self, request, *args, **kwargs):
        ret = {'status': True, 'message': None}
        content = request.body
        return HttpResponse(json.loads(ret))