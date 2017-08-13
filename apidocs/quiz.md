# 获取历史练习列表

|接口定义|http://host:port/rest/exercise|||
| --- | --- | --- | --- |
|请求方式|GET|||
|请求参数|参数说明|参数类型|备注|
|start|开始位置|string|选填，默认1|
|limit|获取数量|string|选填，默认10|
|grade|年级|string|可选|
|subject|学科|string|可选|
|status|状态|string|可选，多个逗号分隔，pending,finished,cancel|
|返回值||||
|code|状态码|int||
|list|返回信息|Array||

请求示例：
```
curl -X GET \
  -H "Content-Type: application/json" \
  http://host:port/rest/exercise/?start=1&limit=20&grade=初中&subject=数学
```

返回数据：
```
{
    "code": 900,
    "list": [
        {
            "e_id": "58cd71a9ba2a740cac2481f0",  //每次练习唯一ID
            "estore_id": "58c54b7ace0e892e1007dd1b",   //题库ID
            "grade": "初中",  
            "subject": "数学",
            "status": "finished",  //状态
            "score": 9,   //得分
            "createdAt": "2017-03-13T13:43:05.608Z" //时间
        },
        {
            "e_id": "58c54c2f3bdf6c2ce4c0db97",
            "estore_id": "58c54b7ace0e892e1007dd1b",
            "grade": "初中",
            "subject": "数学",
            "status": "finished",
            "score": 0,
            "createdAt": "2017-03-12T14:25:03.458Z"
        }
    ]
}
```


# 开始一个新的练习

说明：每次测试开始之前，传入年级（小学、初中、高中等等）、学科（数学、语文、英语等等），获取一个e_id，为每次测试的唯一ID。

暂时测试用：grade=初中，subject=数学。

|接口定义|http://host:port/rest/exercise|||
| --- | --- | --- | --- |
|请求方式|POST|||
|请求参数|参数说明|参数类型|备注|
|grade|年级|string|必填|
|subject|学科|string|必填|
|返回值||||
|code|状态码|int||
|e_id|练习唯一ID|string||

请求示例：
```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"grade": "初中", "subject":"数学"}' \
  http://host:port/rest/exercise
```


返回示例：
```
{
    "code": 900,
    "e_id": "58cd71a9ba2a740cac2481f0"   //练习唯一ID
}
```

# 获取一个练习的信息

说明：

|接口定义|http://host:port/rest/exercise/:e_id|||
| --- | --- | --- | --- |
|请求方式|GET|||
|返回值||||
|code|状态码|int||
|info|练习信息|Object||

请求示例：
```
curl -X GET \
  -H "Content-Type: application/json" \
  http://host:port/rest/exercise/58cd71a9ba2a740cac2481f0
```

返回示例：
```
{
    "code": 900,
    "info": {
        "e_id": "58cd71a9ba2a740cac2481f0",
        "userID": "58c4302406b5812dd4de11eb",
        "grade": "初中",
        "subject": "数学",
        "estore_id": "58c54b7ace0e892e1007dd1b",
        "questions": [
            "584509633b06901b6412d86d",
            "584509b2a2c5c021988fd830"
        ],
        "status": "pending",
        "score": 13,
        "createdAt": "2017-03-12T14:25:03.458Z"
    }
}
```

# 获取练习下一道题

说明：练习过程中，获取下一道未作答的题目的q_id，如果返回的是空字符串，说明本套测试已经全部作答完毕。

|接口定义|http://host:port/rest/exercise/:e_id/next|||
| --- | --- | --- | --- |
|请求方式|GET|||
|返回值||||
|code|状态码|int||
|info|练习信息|Object||

请求示例：
```
curl -X GET \
  -H "Content-Type: application/json" \
  http://host:port/rest/exercise/58cd71a9ba2a740cac2481f0/next
```

返回结果：
```
{
    "code": 900,
    "q_id": "584509633b06901b6412d86d"
}
```

# 获取问题详情

|接口定义|http://host:port/rest/question/:q_id|||
| --- | --- | --- | --- |
|请求方式|GET|||
|返回值||||
|code|状态码|int||
|info|问题信息|Object||

请求示例：
```
curl -X GET \
  -H "Content-Type: application/json" \
  http://host:port/rest/question/58cd71a9ba2a740cac2481f0
```

返回结果：
```
{
    "code": 900,
    "info": {
        "q_id": "584509633b06901b6412d86d",
        "grade": "初中",
        "subject": "数学",
        "content": "化简 $$(\\sqrt{-5-m}-1)^{-1}\\times\\sqrt{-5-m}+\\frac{1}{|m^2-2m+1|}\\div\\frac{1}{m^2-1}\\times(m-1)-\\frac{1}{\\sqrt{-5-m}-1}$$ 正确的是（），若其中m满足一元二次方程 $$m^2+(5\\sqrt{3}tan30^{\\circ})m-12cos60^{\\circ}=0$$ 。则原算式的值为：（）",
        "choice": [
            {
                "correct": false,
                "_id": "584509633b06901b6412d86c",
                "action": "hint",
                "hint": "",
                "flag": "A",
                "content": "$$2-m$$，$$8$$"
            },
            {
                "correct": false,
                "_id": "584509633b06901b6412d86b",
                "action": "hint",
                "hint": "提示2",
                "flag": "B",
                "content": "$$2-m$$，$$1$$"
            },
            {
                "correct": false,
                "_id": "584509633b06901b6412d86a",
                "action": "hint",
                "hint": "提示3",
                "flag": "C",
                "content": "$$m+2$$，$$-4$$或$$3$$"
            },
            {
                "correct": true,
                "_id": "584509633b06901b6412d869",
                "action": "result",
                "hint": "提示4",
                "flag": "D",
                "content": "$$m+2$$，不存在"
            }
        ],
        "difficulty": 3,
        "score": 5,
        "remark": "1"
    }
}
```


# 答题

|接口定义|http://host:port/rest/exercise/:e_id/check|||
| --- | --- | --- | --- |
|请求方式|POST|||
|q_id|问题ID|string|必填|
|choice_id|选项ID|string|必填|
|返回值||||
|code|状态码|int||

请求示例：
```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"q_id": "584509633b06901b6412d86d", "choice_id":"584509633b06901b6412d869"}' \
  http://host:port/rest/exercise/58cd71a9ba2a740cac2481f0/next
```

返回结果：
```
{
    "code": 900
}
```



