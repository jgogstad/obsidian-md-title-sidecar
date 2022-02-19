import './styles/folder-title.css';

import FileExplorerNoteCount from 'main';
import { isFolder, iterateItems, withSubfolderClass } from 'misc';
import { AFItem, FileItem, parseYaml, Vault } from 'obsidian';

const detectTitle = (content: string) => {
    // First look into YAML Frontmatters
    const yfmMatch = /---[\r\n]+(.+?)[\r\n]+(---|\.\.\.)/s.exec(content);
    if (yfmMatch !== null) {
        const yamlStr = yfmMatch[1];
        const yfm = parseYaml(yamlStr);
        if (yfm.title) {
            return yfm.title;
        }
    }

    // Then look into H1
    const h1Match = /# (.+)\s*/.exec(content);
    if (h1Match != null) {
        return h1Match[1];
    }

    return '';
};

export const setupTitle = (
    plugin: FileExplorerNoteCount,
    vault: Vault,
    revert = false,
) => {
    if (!plugin.fileExplorer) throw new Error('fileExplorer not found');

    iterateItems(plugin.fileExplorer.fileItems, (item: AFItem) => {
        if (!isFolder(item)) {
            setTitle(item, vault);
        }
    });
};

export const setTitle = (item: FileItem, vault: Vault) => {
    let isFolgezettel = item.file.basename.match(/^[0-9]+[.-/0-9a-z]+[ _]/)!

    if (item.file.extension != 'md' || !isFolgezettel) {
        return;
    }

    if (!item.file.path.contains("slipbox/notater")) {
        return;
    }

    let fzId = item.file.basename.substring(0, item.file.basename.includes(" ") ? item.file.basename.indexOf(' ') : item.file.basename.length)
    let idMatch = fzId.match(/([0-9]+|[a-z]+)/g)!;
    
    if (isFolgezettel && idMatch) {
        let indentCount = idMatch.length - 1;
        let indentStr = (indentCount * 10).toString() + 'px';
        item.titleEl.style.marginLeft = indentStr;
    }

    vault
        .read(item.file)
        .then(function (content) {
            const contentTitle = detectTitle(content);
            if (contentTitle) {
                item.titleInnerEl.textContent = contentTitle;

                const originalTitle = document.createElement('em');
                originalTitle.className = 'folder-filename-title';
                originalTitle.textContent = fzId;
                item.titleInnerEl.append(originalTitle);
            }
        })
        .catch((error) => {
            console.log(
                `Error retrieving content of ${item.file.path}: ${error}`,
            );
        });
};

export const updateTitle = (
    targetList: string[],
    plugin: FileExplorerNoteCount,
    vault: Vault,
) => {
    const { fileExplorer } = plugin;
    if (!fileExplorer) {
        console.error('fileExplorer missing');
        return;
    }
    for (const path of targetList) {
        // check if path available
        if (!fileExplorer.fileItems[path]) continue;
        setTitle(fileExplorer.fileItems[path] as FileItem, vault);
    }
};

const removeTitle = (item: FileItem) => {
    if (item.titleEl.dataset['name']) delete item.titleEl.dataset['name'];
    item.titleEl.removeClass(withSubfolderClass);
};
