
var nowPage = 1;
var pageSize = 10;

function init() {
    bindEvent();
    $('#menu dd').eq(0).trigger('click');
}
init();

// 事件绑定
function bindEvent() {
    // 左侧菜单点击事件
    $('#menu').on('click', 'dd', function (e) {
        $('#menu dd.active').removeClass('active');
        $(this).addClass('active');
        var id = $(this).attr('data-id');
        if(id == 'student-list'){
            getPageChangeData(nowPage);
            $('#add-student-form')[0].reset();
        }
        $('.page').hide();
        $('#' + id).fadeIn();
    });

    // 表格信息编辑按钮点击事件
    $('.edit-submit').on('click', function (e) {
        e.preventDefault();
        submitEditFormData($('#edit-student-form').serialize());
    });

    // 添加学生信息提交按钮点击事件
    $('.add-submit').on('click', function (e) {
        e.preventDefault();
        console.log($('#edit-student-form').serialize());
        submitAddFormData($('#edit-student-form').serialize());
    })

    // 关键字搜索按钮点击事件
    $('#search-submit').on('click', function (e) {
        var value = $('#search-word').val();
        if(!value){
            getPageChangeData(nowPage);
            return false;
        }
        nowPage = 1;
        transferData('/api/student/searchStudent', {
            sex: -1,
            search: value,
            page: nowPage,
            size: pageSize
        }, function (req) {
            console.log(req);
            var allPage = Math.ceil(req.data.cont / pageSize);
            $('#turn-page').turnPage({
                active: nowPage,
                allPage: allPage,
                callback: function (page) {
                    nowPage = page;
                }
            })
            renderTable(req.data.searchList);
        })
    })
}

// 切换页数表格数据渲染
function getPageChangeData(page) {
    // 按页请求数据
    transferData('/api/student/findByPage', {
        page: page,
        size: pageSize
    }, function (req) {
        var allPage = Math.ceil( req.data.cont / pageSize );
        $('#turn-page').turnPage({
            allPage: allPage,
            active: nowPage,
            callback: function (page) {
                nowPage = page;
                getPageChangeData(nowPage);
            }
        });
        // 请求数据成功后渲染表格
        renderTable(req.data.findByPage);
    });
}

// 表格渲染
var tableData = [];
function renderTable(data) {
    var str = '';
    tableData = data;
    data.forEach(function (item, index) {
        str += '<tr>\n' +
            '    <td>'+ item.sNo +'</td>\n' +
            '    <td>'+ item.name +'</td>\n' +
            '    <td>'+ (item.sex ? '女' : '男') +'</td>\n' +
            '    <td>'+ item.email +'</td>\n' +
            '    <td>'+ (new Date().getFullYear() - item.birth) +'</td>\n' +
            '    <td>'+ item.phone +'</td>\n' +
            '    <td>'+ item.address +'</td>\n' +
            '    <td>\n' +
            '    <button class="btn edit" data-index="'+ index +'">编辑</button>\n' +
            '        <button class="btn delete" data-index="'+ index +'">删除</button>\n' +
            '        </td>\n' +
            '        </tr>';
        $('#student-body').html(str);
        bindTableBtn();
    })
}

// 表格按钮点击事件
function bindTableBtn() {
    // 表格编辑按钮点击事件
    $('.edit').on('click', function () {
        var index = $(this).data('index');
        $('.modal').slideDown();
        initEditForm(tableData[index]);
    });

    // 点击遮罩层编辑表单隐藏
    $('.mask').on('click', function () {
        $('.modal').slideUp();
    });

    //  表格删除按钮点击事件
    $('.delete').on('click', function (e) {
        var index = $(this).data('index');
        var isDel = window.confirm('是否确认删除?');
        var sNo = tableData[index].sNo;
        console.log(sNo);
        if(isDel){
            transferData('/api/student/delBySno', {
                sNo : sNo
            }, function () {
                alert('删除成功!');
                $('#menu dd[data-id=student-list]').trigger('click');
            })
        }
    })
}

// 编辑表单回填
function initEditForm(data) {
    var editForm = $('#edit-student-form')[0];
    for(var prop in data){
        if(editForm[prop]){
            if(prop == 'sex'){
                console.log(1);
                data[prop] ? editForm[prop].value = 'female' : editForm[prop].value = 'male';
                continue;
            }
            editForm[prop].value = data[prop];
        }
    }
}

// 性别数据格式转换
function sexDataChange(data) {
    // 将表单中性别的 male 和 female 转换为后端可识别的 0 和 1
    data = data.split('&');
    for(var i = 0; i < data.length; i++){
        if(data[i].split('=')[0] != 'sex'){
            continue;
        }
        else{
            var sex = data[i].split('=');
            if(sex[1] == 'male'){
                sex[1] = 0;
                data[i] = sex.join('=');
            }
            else{
                sex[1] = 1;
                data[i] = sex.join('=');
            }
        }
    }
    data = data.join('&');
    console.log(data);
    return data;
}

// 编辑学生信息提交
function submitEditFormData(data) {
    data = sexDataChange(data);
    transferData('/api/student/updateStudent', data, function () {
        alert('修改成功！');
        $('.modal').slideUp();
        $('#menu dd[data-id=student-list]').trigger('click');
    });
}

// 添加学生信息提交
function submitAddFormData(data) {
    data = sexDataChange(data);
    transferData('/api/student/addStudent', data, function () {
        alert('提交成功');
        $('#add-student-form').get().reset();
        $('#menu dd[data-id=student-list]').trigger('click');
    });
}

// 封装ajax   不同的作为参数传递，相同的封装函数
var flag = false;
function transferData(api, data, callback) {
    if($.type(data) == 'string'){
        data += '&appkey=yugiasuna_1556039918709';
    }
    else{
        data = $.extend(data,{
            appkey : 'yugiasuna_1556039918709'
        });
    }
    if(flag){
        return false;
    }
    flag = true;
    $.ajax({
        type : 'get',
        url : 'http://api.duyiedu.com' + api,
        data : data,
        dataType : 'json',
        success : function (req) {
            if(req.status == 'success'){
                callback(req);
            }
            else{
                console.log(req.msg);
                alert(req.msg);
            }
            flag = false;
        }
    })
}