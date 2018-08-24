(function () {
    var requestUrl = null;

    function bindChangePaper() {
        $('#pagination').on('click','a',function () {
            var num = $(this).text();
            if (num == '首页'){
                num = 1
            } else if(num == '尾页'){
                num = window['num_pages']
            }else{
                 num = $(this).text();
            }
            $('#table_tb').empty();
            DataInit(num)
        })
    }
    
    function bindCheckall() {
        $('#checkall').bind('click', function () {
            $('#table_tb').find(':checkbox').each(function () {
                if ($('#editMode').hasClass('btn-warning')) {
                    if ($(this).prop('checked')) {

                    } else {
                        $(this).prop('checked', true);
                        var $currentTr = $(this).parent().parent();
                        IntoEdit($currentTr)
                    }
                } else {
                    $(this).prop('checked', true);
                }
            })
        })
    }

    function bindInverse() {
        $('#inverse').bind('click', function () {
            $('#table_tb').find(':checkbox').each(function () {
                if ($('#editMode').hasClass('btn-warning')) {
                    if ($(this).prop('checked')) {
                        $(this).prop('checked', false);
                        OutEdit($(this).parent().parent())
                    } else {
                        $(this).prop('checked', true);
                        IntoEdit($(this).parent().parent())
                    }
                } else {
                    if ($(this).prop('checked')) {
                        $(this).prop('checked', false);
                    } else {
                        $(this).prop('checked', true);
                    }
                }
            })
        })
    }

    function bindCancel() {
        $('#cancel').bind('click', function () {
            $('#table_tb').find(':checked').each(function () {
                if ($('#editMode').hasClass('btn-warning')) {
                    $(this).prop('checked', false);
                    OutEdit($(this).parent().parent())
                } else {
                    $(this).prop('checked', false);
                }
            })
        })

    }

    function bindEditMode() {
        $('#editMode').bind('click', function () {
            if ($(this).hasClass('btn-warning')) {
                $(this).removeClass('btn-warning');
                $(this).text('进入编辑模式');
                $('#table_tb').find(':checked').each(function () {
                    var $currentTr = $(this).parent().parent();
                    OutEdit($currentTr)
                })
            } else {
                $(this).addClass('btn-warning');
                $(this).text('退出编辑模式');
                $('#table_tb').find(':checked').each(function () {
                    var $currentTr = $(this).parent().parent();
                    IntoEdit($currentTr)
                })
            }

        })
    }

    function bindCheckbox() {
        $('#table_tb').on('click', ':checkbox', function () {
            if ($('#editMode').hasClass('btn-warning')) {
                var ck = $(this).prop('checked');
                var $currentTr = $(this).parent().parent();
                if (ck) {
                    IntoEdit($currentTr);
                } else {
                    OutEdit($currentTr);
                }
            }
        })
    }

    function bindDelete() {
        $('#delete').bind('click', function () {
            var id_list = [];
            $('#table_tb').find(':checked').each(function () {
                var $deleteTr = $(this).parent().parent();
                var id = $deleteTr.attr('row-id');
                $deleteTr.remove();
                id_list.push(id)
            });
            $.ajax({
                url: requestUrl,
                type: 'DELETE',
                data: {'id_list': JSON.stringify(id_list)},
                dataType: 'JSON',
                success: function (arg) {
                    if (arg.status) {
                        DataInit();
                    }
                    else {
                        alert('保存失败')
                    }
                }
            })
        })
    }

    function bindSave() {
        $('#save').bind('click', function () {
            var post_list = [];
            $('#table_tb').find('tr[edited="true"]').each(function () {
                var temp = {};
                var id = $(this).attr('row-id');
                temp[id] = id;
                $(this).children('[edit-enable="true"]').each(function () {
                    var name = $(this).attr('name');
                    var origin = $(this).attr('origin');
                    var newVal = $(this).attr('new-val');
                    if (origin != newVal) {
                        temp[name] = newVal;
                    }
                });
                post_list.push(temp)
            });
            $.ajax({
                url: requestUrl,
                type: 'PUT',
                data: {'post_list': JSON.stringify(post_list)},
                dataType: 'JSON',
                success: function (arg) {
                    if (arg.status) {
                        DataInit();
                    }
                    else {
                        alert('保存失败')
                    }
                }
            })
        })
    }

    function IntoEdit($tr) {
        $tr.addClass('info');
        $tr.attr('edited', true);
        $tr.children().each(function () {
            var editEnable = $(this).attr('edit-enable');
            var editType = $(this).attr('edit-type');
            if (editEnable == 'true') {
                if (editType == 'select') {
                    var origin = $(this).attr('origin');
                    var globalName = $(this).attr('global-name');
                    var select = document.createElement('select');
                    select.className = 'form-control';
                    $.each(window[globalName], function (g1, v1) {
                        var option = document.createElement('option');
                        option.setAttribute('value', v1[0]);
                        option.innerHTML = (v1[1]);
                        option.className = 'form-control';
                        $(select).append(option)
                    });
                    $(select).val(origin);
                    $(this).html(select);
                } else if (editType == 'input') {
                    var originText = $(this).text();
                    var tag = document.createElement('input');
                    tag.className = 'form-control';
                    tag.style.width = '100%';
                    tag.value = originText;
                    $(this).html(tag)
                }
            }
        })
    }

    function OutEdit($tr) {
        $tr.removeClass('info');
        $tr.children().each(function () {
            var editEnable = $(this).attr('edit-enable');
            var editType = $(this).attr('edit-type');
            if (editEnable == 'true') {
                if (editType == 'select') {
                    //获取select标签节点
                    var $select = $(this).children().first();
                    //  获取select中被选中的option
                    var newId = $select.val();
                    //  获取选中option中的字符串
                    var newText = $select[0].selectedOptions[0].innerHTML;
                    $(this).html(newText);
                    $(this).attr('new-val', newId)

                } else if (editType == 'input') {
                    var $input = $(this).children().first();
                    var alteredText = $input.val();
                    $(this).text(alteredText);
                    $(this).attr('new-val', alteredText);
                }
            }
        })
    }

    // 字符串 格式化
    String.prototype.format = function (kwargs) {
        var ret = this.replace(/{(\w+)}/g, function (km, m) {
            return kwargs[m]
        });
        return ret
    };

    function DataInit(paper) {
        $.ajax({
            url: requestUrl,
            type: 'GET',
            data: {'paper': paper},
            dataType: 'JSON',
            success: function (arg) {
                initGlobal(arg.global_dict);
                initHeader(arg.table_config);
                initBody(arg.table_config, arg.data_list);
                initPaper(arg.paper);
            }
        })
    }

    function initPaper(paper) {
        $('#pagination').html(paper)
    }
    
    function initGlobal(global_dict) {
        // 常用的定义成全局变量  例如下拉框等
        $.each(global_dict, function (k, v) {
            window[k] = v
        })
    }

    function initHeader(table_config) {
        var tr = document.createElement('tr');
        $.each(table_config, function (k, item) {
            if (item.display) {
                var th = document.createElement('th');
                th.innerHTML = item.title;
                $(tr).append(th);
            }
        });
        $('#table_th').empty();
        $('#table_th').append(tr)
    }

    function initBody(table_config, data_list) {
        $.each(data_list, function (k, row) {
            var tr = document.createElement('tr');
            tr.setAttribute('row-id', row['id']);
            // 生成文本信息
            $.each(table_config, function (i, colConfig) {
                if (colConfig.display) {
                    var td = document.createElement('td');
                    var kwargs = {};
                    $.each(colConfig.text.kwargs, function (key, value) {
                        if (value.substring(0, 2) == '@@') {
                            var globalName = value.substring(2, value.length);
                            var currentId = row[colConfig.q];
                            var t = getTextFromGlobalById(globalName, currentId);
                            kwargs[key] = t;
                        }
                        else if (value[0] == '@') {
                            kwargs[key] = row[value.substring(1, value.length)]
                        } else {
                            kwargs[key] = value;
                        }
                    });
                    var temp = colConfig.text.content.format(kwargs);
                    td.innerHTML = temp;
                    $.each(colConfig.attrs, function (kk, vv) {
                        if (vv[0] == '@') {
                            td.setAttribute(kk, row[vv.substring(1, vv.length)])
                        } else {
                            td.setAttribute(kk, vv);
                        }
                    });
                    $(tr).append(td)
                }
            });
            $('#table_tb').append(tr)
        });

    }

    function getTextFromGlobalById(globalName, currentId) {
        var ret = null;
        $.each(window[globalName], function (k, item) {
            if (item[0] == currentId) {
                ret = item[1];
                return
            }
        });
        return ret;
    }

    jQuery.extend({
        'CURD': function (url) {
            requestUrl = url;
            DataInit();
            bindEditMode();
            bindCheckbox();
            bindCheckall();
            bindCancel();
            bindInverse();
            bindSave();
            bindDelete();
            bindChangePaper();
        },
        'changPaper': function (num) {
            DataInit(num)
        }
    })
    /* view示例
       {
            'q': None,
            'title': '选项',
            'display': True,
            'text': {'content': '<input type="checkbox">', 'kwargs': {}},
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
                'q': None,
                'title': '操作',
                'display': True,
                'text': {'content': '<a href="/assetdetail-{m}">{n}</a>', 'kwargs': {'n': "查看详情", 'm': '@id'}},
                'attrs': {}
            },
            */
})();