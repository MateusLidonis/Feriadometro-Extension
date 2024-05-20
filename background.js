const baseURL =
  "https://script.google.com/macros/s/AKfycbxIceWYKXQ33Suxg6Ya-4c9q95ZIn8mwpzi6Kld9x-_Yf9LBaY5QC4Y1R02oNK25J-NHw/exec?";

const now = new Date();

const anoAtual = new Date().getFullYear();

function createNotification() {
  const nationalHolidayURL = `${baseURL}type=nacional&year=${anoAtual}`;

  const requests = [];

  requests.push(fetch(nationalHolidayURL).then((response) => response.json()));

  Promise.all(requests).then((responses) => {
    const [nationalData] = responses;

    const feriadosFuturos = nationalData.filter(
      (feriado) => new Date(feriado.date + " 00:00:00") > now
    );

    feriadosFuturos.sort(
      (a, b) => new Date(a.date + " 00:00:00") - new Date(b.date)
    );

    proximoFeriado = new Date(feriadosFuturos[0].date + " 00:00:00");

    const diaDaSemana = qualDiaDaSemana(feriadosFuturos[0].date).diaDaSemana;

    if (feriadosFuturos) {
      const options = {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Feriadômetro",
        message: `O próximo feriado é ${
          feriadosFuturos[0].name
        } (${formatarData(
          feriadosFuturos[0].date
        )}) O feriado vai cair ${diaDaSemana}`,
        priority: 2,
        requireInteraction: true,
        buttons: [
          { title: "Abrir Feriadômetro" }, // Adicione um botão com o texto que desejar
        ],
      };
      chrome.notifications.create(options);
    } else {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Feriadômetro",
        message: "Nenhum feriado encontrado",
        priority: 2,
        requireInteraction: true,
        buttons: [
          { title: "Abrir Feriadômetro" }, // Adicione um botão com o texto que desejar
        ],
      });
    }
  });
}

function formatarData(data) {
  const partesData = data.split("-"); // Divide a data em partes [ano, mês, dia]
  const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`; // Formatação: dd/mm/aaaa
  return dataFormatada;
}

// Função para converter a data e pegar o dia da semana do feriado
function qualDiaDaSemana(data) {
  // Dividir a string da data em ano, mês e dia
  var partesData = data.split("-");
  var ano = parseInt(partesData[0]);
  var mes = parseInt(partesData[1]);
  var dia = parseInt(partesData[2]);

  // Criar um novo objeto de data
  var novaData = new Date(ano, mes - 1, dia);

  // Array com os nomes dos dias da semana
  var diasDaSemana = [
    "no: Domingo 😭",
    "na: Segunda-feira 😁",
    "na: Terça-feira 😐",
    "na: Quarta-feira 😐",
    "na: Quinta-feira 😁",
    "na: Sexta-feira 😁",
    "no: Sábado 😭",
  ];

  // Obter o dia da semana
  var diaDaSemana = novaData.getDay();

  // Formatar a nova data para mes-dia-ano
  var dataFormatada = `${mes}-${dia}-${ano}`;

  // Retornar a data formatada e o dia da semana
  return { dataFormatada, diaDaSemana: diasDaSemana[diaDaSemana] };
}

chrome.runtime.onStartup.addListener(() => {
  createNotification();
});

chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
      chrome.tabs.create({ url: "https://feriadometro.vercel.app" });
    }
  }
);
