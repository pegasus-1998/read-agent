import { readdir, readFile as readTextFile, lstat } from "node:fs/promises";
import path from "node:path";

const projectDirectory = path.resolve(process.cwd(), "test");

export async function listFiles(): Promise<string[]> {
    const entries = await readdir(projectDirectory, {
        withFileTypes: true,
    });

    return entries
        .filter((entry) => !entry.name.startsWith("."))
        .map((entry) => {
            return entry.isDirectory()
                ? `${entry.name}/`
                : entry.name;
        });
}

export async function readFile(fileName: string): Promise<string> {
    if (
        !fileName ||
        fileName.startsWith(".") ||
        /[\\/:]/.test(fileName)
    ) {
        throw new Error("请提供根目录中的文件名，例如 login.ts");
    }

    const extension = path.extname(fileName).toLowerCase();

    if (![".ts", ".js", ".md", ".txt", ".json"].includes(extension)) {
        throw new Error("暂不支持这种文件类型");
    }

    const filePath = path.join(projectDirectory, fileName);
    const info = await lstat(filePath);

    if (!info.isFile() || info.isSymbolicLink()) {
        throw new Error("只能读取普通文件");
    }

    if (info.size > 20_000) {
        throw new Error("文件太大，请选择20KB以内的文件");
    }

    const content = await readTextFile(filePath, "utf8");

    // 加上行号，方便模型引用。
    return content
        .split("\n")
        .map((line, index) => `${index + 1}: ${line}`)
        .join("\n");
}

export async function searchText(keyword: string): Promise<string> {
    if (!keyword.trim()) {
        throw new Error("搜索关键词不能为空");
    }

    const files = await listFiles();
    const matches: string[] = [];
    const skipped: string[] = [];

    for (const fileName of files) {
        if (fileName.endsWith("/")) continue;

        try {
            // readFile 返回的每行已经包含行号。
            const content = await readFile(fileName);

            for (const line of content.split("\n")) {
                // 去掉行号后再匹配，避免把行号当作代码搜到。
                const separator = line.indexOf(": ");
                const originalText = line.slice(separator + 2);

                if (originalText.includes(keyword)) {
                    matches.push(`${fileName}:${line}`);
                }

                if (matches.length >= 20) {
                    return matches.join("\n") + "\n[达到20条上限，搜索提前结束]";
                }
            }
        } catch {
            skipped.push(fileName);
        }
    }

    const result = matches.length
        ? matches.join("\n")
        : "在已搜索的文件中没有找到匹配内容。";

    return [
        result,
        "[搜索范围：test根目录中的可读取文本文件，不包含子目录]",
        ...(skipped.length ? [`[跳过文件：${skipped.join(", ")}]`] : []),
    ].join("\n");
}