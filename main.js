const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

function createWindow() {
  const janela = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 650,
    title: 'Prompt Mestre Entenda Tec',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  janela.loadFile(
    path.join(__dirname, 'Prompt_Mestre_Entenda_Tec_v3.0.html')
  );
}

ipcMain.handle('obter-versao', () => {
  return app.getVersion();
});

ipcMain.handle('exportar-projeto', async (evento, dados) => {
  const nomePadrao = dados.nomePadrao || 'Projeto-Entenda-Tec';

  const resultado = await dialog.showSaveDialog({
    title: 'Exportar projeto completo',
    defaultPath: nomePadrao,
    buttonLabel: 'Escolher pasta',
    properties: ['showOverwriteConfirmation']
  });

  if (resultado.canceled || !resultado.filePath) {
    return {
      sucesso: false,
      cancelado: true
    };
  }

  try {
    const pastaProjeto = resultado.filePath;

    await fs.mkdir(pastaProjeto, { recursive: true });

    for (const arquivo of dados.arquivos || []) {
      const caminhoArquivo = path.join(pastaProjeto, arquivo.nome);
      await fs.writeFile(caminhoArquivo, arquivo.texto || '', 'utf8');
    }

    return {
      sucesso: true,
      caminho: pastaProjeto
    };

  } catch (erro) {
    return {
      sucesso: false,
      erro: erro.message
    };
  }
});

ipcMain.handle('salvar-texto', async (evento, dados) => {
  const nomePadrao = dados.nomePadrao || 'arquivo.txt';

  const ehHtml = nomePadrao.toLowerCase().endsWith('.html');

  const filtros = ehHtml
    ? [
        { name: 'Página HTML', extensions: ['html'] }
      ]
    : [
        { name: 'Arquivo de texto', extensions: ['txt'] }
      ];

  const resultado = await dialog.showSaveDialog({
    title: ehHtml ? 'Salvar aplicativo HTML' : 'Salvar Prompt Mestre',
    defaultPath: nomePadrao,
    buttonLabel: 'Salvar',
    filters: filtros
  });

  if (resultado.canceled || !resultado.filePath) {
    return {
      sucesso: false,
      cancelado: true
    };
  }

  try {
    await fs.writeFile(resultado.filePath, dados.texto, 'utf8');

    return {
      sucesso: true,
      caminho: resultado.filePath
    };

  } catch (erro) {
    return {
      sucesso: false,
      erro: erro.message
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
