module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'update', // 更新
        'feat', // 添加新功能
        'fix', // 修复
        'refactor', // 重构
        'docs', // 添加文档或注释
        'chore', // 其他更新
        'style', // 样式调整以及代码美化
        'perf', // 代码优化
        'revert', // 撤销提交
        'test', // 测试代码
        'add', // 添加文件
        'remove', // 删除无用文件
        'merge', // 合并分支
        'create', // 创建模块/项目/其他
        'config', // 配置更新
      ],
    ],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 100],
  },
};
