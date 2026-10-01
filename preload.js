const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('entendaTec', {
  salvarTexto: (texto, nomePadrao) =>
    ipcRenderer.invoke('salvar-texto', {
      texto,
      nomePadrao
    }),

  exportarProjeto: (arquivos, nomePadrao) =>
    ipcRenderer.invoke('exportar-projeto', {
      arquivos,
      nomePadrao
    }),

  obterVersao: () => ipcRenderer.invoke('obter-versao')
});
