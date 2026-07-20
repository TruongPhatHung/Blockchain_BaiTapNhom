import api from './api';

const txService = {
    recordOnChainTransfer: async ({ senderWallet, receiverWallet, amount, description, onChainTxHash }) => {
        const response = await api.post('/transactions/on-chain', {
            senderWallet,
            receiverWallet,
            amount,
            description,
            onChainTxHash,
        });
        return response.data;
    },

    getHistory: async (walletAddress) => {
        const response = await api.get(`/transactions/history/${encodeURIComponent(walletAddress)}`);
        return response.data;
    },

    getDetail: async (transactionId) => {
        const response = await api.get(`/transactions/${transactionId}`);
        return response.data;
    },
};

export default txService;
