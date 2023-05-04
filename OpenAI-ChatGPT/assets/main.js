
const client = ZAFClient.init();


async function updateSummary() {
    const convo = await getTicketConvo();
    const prompt = await getPrompt(convo);
    const summary = await getSummary(prompt);
    const container = document.getElementById("container");

    container.innerText = summary;

    document.getElementById('progress-loading').hidden = true;

}

async function updateAnswer() {
    const convo = await getTicketConvo();
    const prompt = await getPromptAnswer(convo);
    const answer = await getAnswer(prompt);
    const containerAnswer = document.getElementById("container-answer");

    containerAnswer.innerText = answer;

    document.getElementById('progress-loading-answer').hidden = true;

}

async function getTicketConvo() {
    const ticketConvo = await client.get("ticket.conversation");
    return JSON.stringify(ticketConvo["ticket.conversation"]);
}

async function getPrompt(convo) {
    return `
Detect the language and write your answer in the same language what you read.
Summarize the following customer service interaction.
Detect the customer's sentiment and extract any key dates,
places, or products in the following three topics.

Summary:

Customer sentiment:

Key Information:

${convo}`;
}


async function getPromptAnswer(convo) {
    return `
Detect the language and write your answer in the same language what you read.
Create a reply.
${convo}`;
}



async function getSummary(prompt) {
    const options = {
        url: "https://api.openai.com/v1/chat/completions",
        type: "POST",
        contentType: "application/json",
        headers: {
            Authorization: "Bearer {{setting.openAiApiToken}}",
        },
        data: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        }),
        secure: true,
    };
    const response = await client.request(options);

    return response.choices[0].message.content.trim();
}

async function getAnswer(prompt) {
    const options = {
        url: "https://api.openai.com/v1/chat/completions",
        type: "POST",
        contentType: "application/json",
        headers: {
            Authorization: "Bearer {{setting.openAiApiToken}}",
        },
        data: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        }),
        secure: true,
    };
    const response = await client.request(options);

    return response.choices[0].message.content.trim();
}


client.on("app.registered", () => {
    client.invoke("resize", { width: "100%", height: "450px" });
    updateSummary();
    updateAnswer();
});

client.on("ticket.conversation.changed", () => {
    updateSummary();
    updateAnswer();
});

document.getElementById('regenerate').onclick = function (event) {
    document.getElementById('progress-loading').hidden = false;
    updateSummary();
}

document.getElementById('regenerate-answer').onclick = function (event) {
    document.getElementById('progress-loading-answer').hidden = false;
    updateAnswer();
}


