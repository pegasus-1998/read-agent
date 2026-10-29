# Read Agent

基于 TypeScript、LangChain 和 DeepSeek 的命令行代码阅读助手。

## 功能

- 列出和读取 test 目录中的代码文件
- 读取文件前需要用户确认
- 根据代码回答问题并引用行号
- 支持多轮对话和本地会话保存

## 使用

安装依赖：

```bash
npm i
```

将 .env.example 复制为 .env，填写自己的 DeepSeek API Key。

启动：

```bash
npx tsx src/main.ts
```

示例问题：

> 请读取 login.ts，解释账号锁定的条件。

输入 `/new` 开始新会话，输入 `exit` 退出。

## 注意

读取的代码会发送给 DeepSeek，API 调用会消耗额度。

请勿提交包含密钥的 .env 和保存聊天记录的 .agent-data 目录。
