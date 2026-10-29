type User = {
  id: number;
  username: string;
  password: string;
  failedAttempts: number;
  locked: boolean;
};

type Result = {
  success: boolean;
  message: string;
};

const users: User[] = [];
let nextId = 1;

// 用户名去掉首尾空格，并统一为小写。
function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function findUser(username: string): User | undefined {
  const normalized = normalizeUsername(username);

  return users.find((user) => user.username === normalized);
}

// 密码至少8位，并且同时包含字母和数字。
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "密码至少需要8位";
  }

  if (!/[a-zA-Z]/.test(password)) {
    return "密码必须包含字母";
  }

  if (!/[0-9]/.test(password)) {
    return "密码必须包含数字";
  }

  return null;
}

export function register(
  username: string,
  password: string,
): Result {
  const normalized = normalizeUsername(username);

  if (normalized.length < 3) {
    return { success: false, message: "用户名至少需要3个字符" };
  }

  if (findUser(normalized)) {
    return { success: false, message: "用户名已存在" };
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return { success: false, message: passwordError };
  }

  users.push({
    id: nextId++,
    username: normalized,
    password,
    failedAttempts: 0,
    locked: false,
  });

  return { success: true, message: "注册成功" };
}

export function login(
  username: string,
  password: string,
): Result {
  const user = findUser(username);

  if (!user) {
    return { success: false, message: "用户名或密码错误" };
  }

  if (user.locked) {
    return { success: false, message: "账号已锁定" };
  }

  if (user.password !== password) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= 3) {
      user.locked = true;
      return { success: false, message: "连续失败3次，账号已锁定" };
    }

    return { success: false, message: "用户名或密码错误" };
  }

  user.failedAttempts = 0;

  return { success: true, message: "登录成功" };
}

export function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string,
): Result {
  const user = findUser(username);

  if (!user) {
    return { success: false, message: "用户不存在" };
  }

  if (user.locked) {
    return { success: false, message: "账号已锁定，无法修改密码" };
  }

  if (user.password !== oldPassword) {
    return { success: false, message: "旧密码错误" };
  }

  if (newPassword === oldPassword) {
    return { success: false, message: "新密码不能与旧密码相同" };
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    return { success: false, message: passwordError };
  }

  user.password = newPassword;
  user.failedAttempts = 0;

  return { success: true, message: "密码修改成功" };
}