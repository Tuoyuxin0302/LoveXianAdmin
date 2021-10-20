// 定义常用的校验，常用的正则 https://www.open-open.com/code/view/1430625516632
layui.define(["jquery", "baseSetting", "lovexian"], function (exports) {
  var $ = layui.jquery;
  var lovexian = layui.lovexian;
  var setter = layui.setter;
  var proPath = layui.baseSetting.LoveXianConfig.proApi;
  exports("validate", {
    username: function (value, item) {
      if (!isEmpty(value)) {
        var result = "";
        $.ajax({
          url: proPath + "/system/admin/check/" + value,
          headers: {
            Authentication: layui.data(setter.tableName)[setter.TOKENNAME],
          },
          async: false,
          type: "get",
          success: function (d) {
            if (d.data == false) {
              result = "该用户名已存在";
            }
          },
        });
        if (!isEmpty(result)) {
          return result;
        }
      }
    },
    cron: function (value, item) {
      if (!isEmpty(value)) {
        var result = "";
        $.ajax({
          url: proPath + "/system/job/cron/check",
          data: {
            cron: value,
          },
          async: false,
          type: "get",
          success: function (d) {
            !d && (result = "cron表达式不合法");
          },
        });
        if (!isEmpty(result)) {
          return result;
        }
      }
    },
    email: function (value) {
      if (!isEmpty(value)) {
        if (
          !new RegExp(
            "^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$"
          ).test(value)
        ) {
          return "请填写正确的邮箱";
        }
      }
    },
    phone: function (value) {
      if (!isEmpty(value)) {
        if (!new RegExp("^1\\d{10}$").test(value)) {
          return lovexian.alert.error("请填写正确的手机号码");
        }
      }
    },
    number: function (value) {
      if (!isEmpty(value)) {
        if (!new RegExp("^[0-9]*$").test(value)) {
          return "只能填写数字";
        }
      }
    },
    notnull: function (value, item) {
      if (isEmpty(value)) {
        return "必填项不能为空";
      }
    },
    range: function (value, item) {
      var minlength = item.getAttribute("minlength")
        ? item.getAttribute("minlength")
        : -1;
      var maxlength = item.getAttribute("maxlength")
        ? item.getAttribute("maxlength")
        : -1;
      var length = value.length;
      if (minlength === -1) {
        if (length > maxlength) {
          return "长度不能超过 " + maxlength + " 个字符";
        }
      } else if (maxlength === -1) {
        if (length < minlength) {
          return "长度不能少于 " + minlength + " 个字符";
        }
      } else {
        if (length > maxlength || length < minlength) {
          return "长度范围 " + minlength + " ~ " + maxlength + " 个字符";
        }
      }
    },
    imgnotnull: function (value, item) {
      var srcvalue = item.getAttribute("src");
      if (isEmpty(srcvalue)) {
        return "封面图片不能为空";
      }
    }
  });

  function isEmpty(obj) {
    return typeof obj == "undefined" || obj == null || obj === "";
  }
});
