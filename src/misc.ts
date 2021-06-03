import { AFItem, FolderItem, TFolder, FileExplorer } from "obsidian";
import { dirname } from "path";

export const isFolder = (item: AFItem): item is FolderItem =>
  (item as FolderItem).file instanceof TFolder;

export function iterateItems(
  items: FileExplorer['fileItems'],
  callback: (item: AFItem) => any,
): void {
  for (const key in items) {
    if (!Object.prototype.hasOwnProperty.call(items, key)) continue;
    callback(items[key]);
  }
}

export const getParentPath = (src: string) => {
  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};