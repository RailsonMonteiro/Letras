let musicFolderHandle = null;

// Selecionar pasta 'musicas'
document.getElementById("selecionarPasta").addEventListener("click", async () => {
  try {
    musicFolderHandle = await window.showDirectoryPicker();
    document.getElementById("pastaStatus").textContent = `Pasta selecionada: ${musicFolderHandle.name} ✅`;
  } catch {
    alert("Seleção de pasta cancelada ou não suportada.");
  }
});

// Apenas gerar JSON no campo de resultado
document.getElementById("processar").addEventListener("click", () => {
  const titulo = document.getElementById("titulo").value.trim();
  const artista = document.getElementById("artista").value.trim();
  const letra = document.getElementById("letra").value.trim();
  const vozName = document.getElementById("vozName").value.trim();
  const pbName = document.getElementById("pbName").value.trim();

  if (!titulo || !artista || !letra) {
    alert("Preencha pelo menos título, artista e letra para processar!");
    return;
  }

  const letraFormatada = letra.replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");

  const musica = `{
  "id":0,
  "titulo":"${titulo}",
  "artista":"${artista}",
  "letra":"${letraFormatada}",
  "voz":"${vozName ? `musicas/${vozName}.mp3` : ""}",
  "pb":"${pbName ? `musicas/${pbName}.mp3` : ""}"
}`;

  document.getElementById("resultado").value = musica;
  alert("Letra processada! Agora você pode copiar e salvar os arquivos (se houver).");
});

// Copiar JSON e salvar arquivos somente se selecionados
document.getElementById("copiar").addEventListener("click", async () => {
  const resultado = document.getElementById("resultado").value.trim();
  const vozFile = document.getElementById("voz").files[0];
  const pbFile = document.getElementById("pb").files[0];
  const vozName = document.getElementById("vozName").value.trim();
  const pbName = document.getElementById("pbName").value.trim();

  if (!resultado) {
    alert("Nenhuma letra processada para copiar!");
    return;
  }

  try {
    // Copiar JSON para área de transferência
    await navigator.clipboard.writeText(resultado);

    if (musicFolderHandle) {
      // Função auxiliar para salvar arquivo
      async function salvarArquivo(fileHandle, file) {
        const writable = await fileHandle.createWritable();
        await writable.write(await file.arrayBuffer());
        await writable.close();
      }

      // Salvar arquivo Voz se selecionado
      if (vozFile && vozName) {
        let fileHandle = await musicFolderHandle.getFileHandle(`${vozName}.mp3`, { create: true });
        await salvarArquivo(fileHandle, vozFile);
      }

      // Salvar arquivo PB se selecionado
      if (pbFile && pbName) {
        let fileHandle = await musicFolderHandle.getFileHandle(`${pbName}.mp3`, { create: true });
        await salvarArquivo(fileHandle, pbFile);
      }
    }

    alert("Música copiada com sucesso! Arquivos salvos, se selecionados.");

    // Limpar campos
    document.getElementById("titulo").value = "";
    document.getElementById("artista").value = "";
    document.getElementById("letra").value = "";
    document.getElementById("voz").value = "";
    document.getElementById("vozName").value = "";
    document.getElementById("pb").value = "";
    document.getElementById("pbName").value = "";
    document.getElementById("resultado").value = "";

  } catch (err) {
    console.error(err);
    alert("Erro ao copiar ou salvar os arquivos. Verifique permissões do navegador.");
  }
});
