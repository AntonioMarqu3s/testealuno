
/**
 * API endpoint configurations for QR code operations
 */

// Primary endpoints
export const PRIMARY_QR_CODE_ENDPOINT = 'https://n8n-n8n.31kvca.easypanel.host/webhook/atualizar-qr-code';
export const PRIMARY_CREATE_INSTANCE_ENDPOINT = 'https://n8n-n8n.31kvca.easypanel.host/webhook/criar-instancia';
export const PRIMARY_STATUS_ENDPOINT = 'https://n8n-n8n.31kvca.easypanel.host/webhook/verificar-status';

// Fallback endpoints
export const FALLBACK_QR_CODE_ENDPOINT = 'https://webhook.dev.matrixgpt.com.br/webhook/atualizar-qr-code';
export const FALLBACK_CREATE_INSTANCE_ENDPOINT = 'https://webhook.dev.matrixgpt.com.br/webhook/criar-instancia';
export const FALLBACK_STATUS_ENDPOINT = 'https://webhook.dev.matrixgpt.com.br/webhook/verificar-status';

// Timeouts (in milliseconds)
export const QR_CODE_REQUEST_TIMEOUT = 15000;
export const STATUS_CHECK_TIMEOUT = 8000;
