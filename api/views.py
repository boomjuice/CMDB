from django.shortcuts import render
from django.http import JsonResponse
import json
from app01.models import *


def index(request):
    if request.method == 'POST':
        server_info = json.loads(request.body.decode('utf-8'))
        server_info = json.loads(server_info)
        hostname = server_info['hostname']
        disk_dict = server_info['disk']['data']
        disk_new_list = []
        for k,v in disk_dict.items():
            disk_new_list.append(k)
        sid = Server.objects.get(hostname=hostname)
        disk_old_list = Server.objects.filter(hostname=hostname).values_list('disk__slot')
        disk_old_list = list(zip(*disk_old_list))[0]  # 2 ,4
        disk_add_list = list(set(disk_new_list).difference(set(disk_old_list)))  # 新的有而旧的没有
        disk_del_list = list(set(disk_old_list).difference(set(disk_new_list)))  # 新的没有而旧的有
        disk_up_list = list(set(disk_new_list).intersection(set(disk_old_list)))  # 新的里面有旧的也有
        for slot in disk_add_list:
            add_disk = server_info['disk']['data'][slot]
            Disk.objects.create(**add_disk, server_obj=sid)

        for slot in disk_del_list:
            Disk.objects.filter(slot=slot).delete()

        for slot in disk_up_list:
            up_disk = server_info['disk']['data'][slot]
            Disk.objects.filter(slot=slot).update(**up_disk)

        ret = {'code': 1000, 'message': None}
    return JsonResponse(ret)