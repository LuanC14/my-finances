async function handlePost(url, apiKey, userKey, body, lastUpdateKey) {
    try {
        const lastUpdateLocalRaw = localStorage.getItem(lastUpdateKey);

        const lastUpdateLocal = lastUpdateLocalRaw
            ? parseInt(JSON.parse(lastUpdateLocalRaw))
            : null;

        const response = await fetch(url, {
            headers: {
                "X-Master-Key": apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: status ${response.status}`);
        }

        const data = await response.json();

        const lastUpdateDataRaw = data?.record?.last_update;
        const lastUpdateData = lastUpdateDataRaw
            ? parseInt(lastUpdateDataRaw)
            : null;

        if (
            lastUpdateData &&
            lastUpdateLocal &&
            lastUpdateData !== lastUpdateLocal
        ) {
            alert("É necessário sincronizar os dados.");
            return;
        }

        const currentTime = Date.now();

        const updatedData = {
            id: userKey,
            last_update: currentTime,
            ...body
        };

        const putResponse = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": apiKey,
            },
            body: JSON.stringify(updatedData),
        });

        if (!putResponse.ok) {
            throw new Error(
                `Erro ao salvar os dados: status ${putResponse.status}`
            );
        }

        return {
            ok: true,
            timestamp: currentTime
        }

    } catch (error) {
        console.error("Erro ao processar handleRequest:", error);
        return {
            ok: false
        }
    }
}

async function handleGetBalance(url, apiKey) {

    try {
        const response = await fetch(url, {
            headers: {
                "X-Master-Key": apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: status ${response.status}`);
        }

        const data = await response.json();

        const lastUpdateDataRaw = data?.record?.last_update;

        const lastUpdateData = lastUpdateDataRaw
            ? parseInt(lastUpdateDataRaw)
            : null;

        const balances = data?.record?.balance;

        return {
            ok: true,
            body: {
                balances,
                timestamp: lastUpdateData
            }
        }
    } catch (error) {
        console.error("Erro ao processar handleRequest:", error);
        return {
            ok: false
        }
    }


}

async function handleGetExpenses(url, apiKey) {
    try {
        const response = await fetch(url, {
            headers: {
                "X-Master-Key": apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: status ${response.status}`);
        }

        const data = await response.json();

        const lastUpdateDataRaw = data?.record?.last_update;

        const lastUpdateData = lastUpdateDataRaw
            ? parseInt(lastUpdateDataRaw)
            : null;

        const expenses = data?.record?.expenses;

        return {
            ok: true,
            body: {
                expenses,
                timestamp: lastUpdateData
            }
        }
    } catch (error) {
        console.error("Erro ao processar handleRequest:", error);
        return {
            ok: false
        }
    }
}

export { handlePost, handleGetBalance, handleGetExpenses }