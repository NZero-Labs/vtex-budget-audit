import { getVTEXBaseUrl, getVTEXConfig, getVTEXHeaders, isMockMode } from "./config";
import { IntegratorClient, IntegratorRecord } from "@/lib/spreadsheet-validation";

export function createVTEXIntegratorClient(): IntegratorClient {
  if (isMockMode()) return mockIntegratorClient;

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);

  return {
    async searchByDocument(document: string): Promise<IntegratorRecord[]> {
      const url = new URL(`${baseUrl}/api/dataentities/IN/search`);
      url.searchParams.set("document", document);
      url.searchParams.set("_fields", "_all");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...headers,
          "REST-Range": "resources=0-4000",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Erro ao buscar integrador: ${response.status} ${body}`);
      }

      return response.json();
    },

    async resetCouponFlag(documentId: string): Promise<void> {
      const response = await fetch(`${baseUrl}/api/dataentities/IN/documents/${documentId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ has_used_coupon: "false" }),
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Erro ao atualizar integrador: ${response.status} ${body}`);
      }
    },
  };
}

const mockIntegratorClient: IntegratorClient = {
  async searchByDocument(document: string) {
    return [
      {
        id: `mock-${document}`,
        document,
        has_used_coupon: document.endsWith("0") ? "false" : true,
      },
    ];
  },
  async resetCouponFlag() {
    return undefined;
  },
};
