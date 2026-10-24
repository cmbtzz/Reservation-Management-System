# 多人协作开发指南

## 分支约定

- `main`：保存稳定、可发布的代码。
- `dev`：团队共享的开发集成分支。每位开发者在自己的本地仓库跟踪它，不需要各建一个长期个人 `dev` 分支。
- 功能分支：从最新的 `dev` 创建，一个分支只处理一个功能、修复或独立任务，完成后通过 Pull Request（PR）合入 `dev`。
- 人工创建的任务分支可使用 `feature/<任务名>`、`fix/<问题名>` 或 `docs/<主题>`；Agent 创建的分支统一加 `codex/` 前缀，例如 `codex/feature/reservation-cancel`。
- 避免直接向 `main`、`dev` 提交或推送业务改动；日常开发使用任务分支。

常规流向：`dev → 任务分支 → PR → dev → 发布 PR → main`。

## 首次准备 dev

先运行 `git fetch origin`，检查远端是否已有 `dev`。已有时，本地尚无 `dev` 的开发者执行：

```bash
git switch --track origin/dev
```

只有远端和本地都没有 `dev` 时，由一位负责初始化的开发者从最新的 `main` 创建并推送，其他人随后跟踪远端分支：

```bash
git switch main
git pull --ff-only origin main
git switch -c dev
git push -u origin dev
```

切换分支前先检查工作区，妥善保存未提交改动；不要为了切换分支而丢弃他人的工作。

## 开始一个任务

1. 确认任务范围、负责人和可能涉及的公共文件，提前协调容易重叠的改动。
2. 检查 `git status`，确认当前分支及未提交改动。
3. 更新本地 `dev`，再创建自己的任务分支：

```bash
git switch dev
git pull --ff-only origin dev
git switch -c codex/feature/reservation-cancel
```

若 `--ff-only` 失败，先检查本地与远端的分叉原因，再决定如何整合，不要使用强制重置覆盖本地提交。

## 开发与同步

- 保持改动聚焦，优先提交小而完整、便于审查的变更；避免顺手做全项目格式化或无关重构。
- 提交前检查工作区和暂存区的 diff，按目的拆分提交；分类、标题和 description 遵循 [提交信息生成指南](.github/copilot-instructions.md)。
- 按文件或代码块暂存，例如使用 `git add <文件路径>` 或 `git add -p`，避免误提交他人的改动、凭据、本地配置和构建产物。
- 在任务分支上定期同步最新 `dev`；以下命令需要先保存未提交改动，并确认当前确实处于自己的任务分支：

```bash
git fetch origin
git merge origin/dev
```

- 遇到冲突时，理解双方改动的目的，必要时与相关开发者确认，解决后重新验证；不要直接整批选择“全部使用我的”或“全部使用对方的”。
- 已推送且由多人使用的分支优先通过 merge 同步，避免 rebase 或强制推送改写他人依赖的历史。
- 多个 Agent 或开发者在同一机器并行工作时，使用各自的 checkout 或 Git worktree，避免在共享工作目录中切换分支、暂存或提交彼此的文件。

## 提交 Pull Request

完成本地检查后，将任务分支推送到远端：

```bash
git push -u origin codex/feature/reservation-cancel
```

在代码托管平台创建 PR，源分支选择任务分支，目标分支选择 `dev`。尚未完成、但需要提前讨论的工作可以先开 Draft PR。

PR 标题简洁描述本次改动，正文通常包含：

- 改动目的：解决什么问题，为什么需要修改。
- 主要变化：最终行为和涉及范围，必要时提供前后对比或界面截图。
- 验证结果：已执行的检查、测试或手动验证；未验证的部分如实说明。
- 影响与迁移：兼容性、配置、依赖或数据结构变化；有对应任务时附上链接。

提交前自行审查整个 PR diff，确认没有无关文件、调试内容或敏感信息。邀请相关开发者审查，处理反馈后再请求复审。

## 审查、合并与发布

- 合并前确认 PR 范围清晰、冲突已解决、适用检查通过，且审查意见已处理。
- 建议为 `main` 和 `dev` 设置分支保护，要求通过 PR 合并及必要的检查和审查；具体要求以仓库设置和团队约定为准。
- 任务 PR 可按团队约定选择 squash merge 或普通 merge；使用 squash 时，最终提交信息同样遵循提交规范。
- 合并后更新本地 `dev`，确认集成结果；任务分支不再需要时再清理，本地可用 `git branch -d <分支名>` 安全删除。若因 squash 导致 Git 判断尚未合并，先核对 PR 和提交内容，不要直接强制删除。
- 发布时从 `dev` 向 `main` 提交 PR，说明本次发布范围和验证结果；优先采用保留分支共同历史的合并方式，避免长期分支之间反复 squash 造成历史分叉。
- 紧急修复可从最新 `main` 创建 `fix/` 分支（Agent 使用 `codex/fix/`），通过 PR 合入 `main`，随后将修复同步回 `dev`，避免后续发布丢失修复。
