const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const video = document.getElementById('video');
const downloadLink = document.getElementById('downloadLink');

let mediaRecorder;
let recordedChunks = [];

startBtn.addEventListener('click', async () => {
  try {
    // Captura apenas o vídeo, desativando o áudio
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,  // Captura apenas o vídeo
      audio: false  // Desativa o áudio
    });

    // Inicializa o MediaRecorder
    mediaRecorder = new MediaRecorder(screenStream);

    // Armazena os dados gravados quando o MediaRecorder os disponibiliza
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Quando a gravação termina, cria um blob do vídeo
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Define o vídeo para visualização
      video.src = url;
      video.play();
      
      // Define o link de download com nome personalizado
      downloadLink.href = url;
      downloadLink.download = `gravação_${new Date().toISOString().split('T')[0]}.webm`;  // Nome do arquivo baseado na data
      downloadLink.style.display = 'block';  // Mostra o link de download
      recordedChunks = [];  // Reseta os chunks
    };

    // Inicia a gravação
    mediaRecorder.start();

    // Atualiza os botões
    startBtn.disabled = true;
    stopBtn.disabled = false;
    downloadLink.style.display = 'none'; // Oculta o link de download durante a gravação
  } catch (err) {
    console.error('Erro ao capturar a tela: ', err);
  }
});

stopBtn.addEventListener('click', () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
});
