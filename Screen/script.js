const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const video = document.getElementById('video');
const downloadLink = document.getElementById('downloadLink');

let mediaRecorder;
let recordedChunks = [];

// Função para detectar a largura de banda da internet e ajustar a qualidade
function getVideoOptions() {
  // Verifica se a API de Network Information está disponível
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  let videoBitsPerSecond;
  let frameRate;

  if (connection) {
    // Baseia a qualidade na largura de banda efetiva
    const downlink = connection.downlink; // velocidade de download em megabits por segundo

    if (downlink >= 10) {
      // Alta largura de banda
      videoBitsPerSecond = 5000000; // 5 Mbps
      frameRate = 60;
    } else if (downlink >= 3) {
      // Média largura de banda
      videoBitsPerSecond = 2500000; // 2.5 Mbps
      frameRate = 30;
    } else {
      // Baixa largura de banda
      videoBitsPerSecond = 1000000; // 1 Mbps
      frameRate = 15;
    }
  } else {
    // Caso a API não esteja disponível, usar uma qualidade padrão
    videoBitsPerSecond = 2500000; // 2.5 Mbps
    frameRate = 30;
  }

  return {
    videoBitsPerSecond,
    frameRate
  };
}

startBtn.addEventListener('click', async () => {
  try {
    // Obtém as opções de vídeo de acordo com a largura de banda
    const { videoBitsPerSecond, frameRate } = getVideoOptions();

    // Captura apenas o vídeo, desativando o áudio
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: frameRate
        
      },
      audio: false // Desativa o áudio
    });

    // Inicializa o MediaRecorder com as opções de qualidade
    mediaRecorder = new MediaRecorder(screenStream, {
      videoBitsPerSecond: videoBitsPerSecond
    });

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
