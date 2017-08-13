# 用户登陆

说明：在`redirect.html`页面，通过url获取到userid、token、category参数，传递给该接口进行登陆。

暂时测试环境用假的参数，userid=abc即可。

|接口定义|http://host:port/reste/login|||
| --- | --- | --- | --- |
|请求方式|POST|||
|请求参数|参数说明|参数类型|备注|
|userid||string|必填|
|token||string|必填|
|category||string|必填|
|返回值||||
|code|状态码|int||
|info|返回信息|Object||

请求示例：
```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"userid": "xxxx", "token":"xxxx", "category":"xxx"}' \
  http://host:port/rest/login
```


返回示例：
```
{
    "code": 900,
    "info": {
        "userID": "58c4302406b5812dd4de11eb",  //系统userID
        "ext_id": "aaa"   //外部userID
    }
}
```


# 获取用户信息

说明：登陆用户获取用户信息。

|接口定义|http://host:port/rest/info|||
| --- | --- | --- | --- |
|请求方式|GET|||
|返回值||||
|code|状态码|int||
|info|返回信息|Object||


请求示例：
```
```

返回示例：
```
```


