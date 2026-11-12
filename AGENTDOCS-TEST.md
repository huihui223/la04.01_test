# agentdocs 自动安装测试

这是本地合成测试子模块，不是真实业务 CLI；无需 npm registry 或业务 Git 网络。

## 初始状态

- `framework` 是真实 Git 子模块；本地 origin 位于 `.git/agentdocs-fixture-origin.git`。
- `main` 分支故意没有 `@agentdoc/cli`，`UAT_80` 分支包含可安装的同名包。
- 项目根尚未安装 CLI；自动保障应发现远端分支证据、切换 UAT_80，再执行两层 npm 安装。
- `.gitmodules` 使用本机绝对地址，仅供这台机器测试，不要推送此配置作为公共子模块配置。

## 客户端验收

1. 用包含该仓库的**业务项目**打开 Code 模式 Kimi 会话，工作目录选择本仓库；仅打开普通/默认项目不会触发业务资格。
2. 使用包含本次修复的开发客户端，新建会话，发送：
   “请调用 knowledge_search 搜索 AGENTDOCS_INSTALL_OK，并用返回的 read 目标调用 knowledge_read。”
3. 应先看到 CLI 准备/同步/安装信息，完成后才执行知识工具；search 的 sources/results 出现 agentdocs，read 返回测试内容。
4. 同会话再次调用不重复执行安装。测试返回固定标记，仅证明链路，不证明真实业务检索质量。

## 终端观察

```sh
git -C framework branch --show-current
./node_modules/.bin/agentdocs --version
./node_modules/.bin/agentdocs search AGENTDOCS_INSTALL_OK --json
```

预期安装后分支 UAT_80、版本 0.0.0-test、结果包含 AGENTDOCS_INSTALL_OK。

需要模拟慢安装时，可在启动开发客户端的同一终端导出 `AGENTDOCS_FIXTURE_DELAY_MS=65000`；CLI 源目录的 npm preinstall 将延迟 65 秒，安装器原有 180 秒上限仍生效。默认不延迟。

已生成的根 package.json/.npmrc/.gitignore 是测试配置；.gitmodules 和子模块链接由 git submodule add 暂存，未提交。原 README.md 保持不变。

## 已执行的真实验证

本机真实 git/npm + 仓库当前安装器验证 PASS，安装与首次 search/read 共 2873ms；search/read 不重复安装，根安装仅执行一次。结果见 `AGENTDOCS-TEST-RESULT.json`。未通过桌面 GUI 或真实 Kimi 请求进行端到端验收。验证后已恢复 main 分支且 CLI 未安装。

重复客户端测试前，在本仓库执行：

```sh
node scripts/reset-agentdocs-test.mjs
```

随后新建 Kimi 会话（同会话会保留已执行/失败缓存）。脚本仅适用于本合成测试项目；检测到其他依赖会拒绝重置。安装后 framework 的提交可能与父仓库暂存的 main 提交不同，这是测试切至 UAT_80 的预期结果。
