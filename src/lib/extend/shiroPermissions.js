// 必须包含列出的所有权限，元素才显示
function hasPermission(needPers){
     console.log("需要的权限："+needPers);
    //取得用户权限信息
    var userPers = layui.data(layui.setter.tableName)[layui.setter.PERMISSION]
    for(var i=0;i<needPers.length; i++){
        // console.log(needPers[i]);
        if( userPers.includes(needPers[i]) == false){
            return false;
        }
    }
    return true;
}

// 与hasPermission逻辑相反，当前用户没有指定权限时，验证通过。
function lacksPermission(lacksPers){
    //取得用户权限信息
    var userPers = layui.data(layui.setter.tableName)[layui.setter.PERMISSION]
    for(var i=0;i<lacksPers.length; i++){
        if( userPers.includes(lacksPers[i])){
            return false;
        }
    }
    return true;
}

// 当不包含列出的权限时，渲染该元素
function hasNoPermission(noPers){
    //取得用户权限信息
    var userPers = layui.data(layui.setter.tableName)[layui.setter.PERMISSION];
    for(var i=0;i<noPers.length; i++){
        if( userPers.includes(noPers[i]) == true){
            return false;
        }
    }
    return true;
}

// 只要包含列出的任意一个权限，元素就会显示
function hasAnyPermission(anyPers){
    //取得用户权限信息
    var userPers = layui.data(layui.setter.tableName)[layui.setter.PERMISSION];
    for(var i=0;i<anyPers.length; i++){
        if( userPers.includes(anyPers[i]) == true){
            return true;
        }
    }
    return false;
}

// 必须包含列出的所有角色，元素才显示
function hasRole(needRoles){
    //取得用户角色信息
    var userRoles = layui.data(layui.setter.tableName)[layui.setter.ROLE];
    for(var i=0;i<needRoles.length; i++){
        if( userRoles.includes(needRoles[i]) == false){
            return false;
        }
    }
    return true;
}

function hasAnyRole(anyRoles){
    //取得用户角色信息
    var userRoles = layui.data(layui.setter.tableName)[layui.setter.ROLE];
    for(var i=0;i<anyRoles.length; i++){
        if( userRoles.includes(anyRoles[i]) == true){
            return true;
        }
    }
    return false;
}
