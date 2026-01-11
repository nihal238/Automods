import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  carBrand?: string;
  carModel?: string;
  customizations?: {
    bodyColor?: string;
    wheelType?: string;
    headlightType?: string;
    bumperType?: string;
    spoilerType?: string;
    decalType?: string;
  };
  selectedServices?: string[];
  estimatedPrice: number;
  requestType: "customizer" | "estimator";
}

const colorNames: Record<string, string> = {
  "#e63946": "Racing Red",
  "#1d3557": "Deep Blue",
  "#2a9d8f": "Emerald Green",
  "#f4a261": "Sunset Orange",
  "#9b59b6": "Royal Purple",
  "#1a1a2e": "Midnight Black",
  "#f1faee": "Pearl White",
  "#ffd700": "Golden Yellow",
};

const formatCustomizations = (customizations: QuoteRequest["customizations"]) => {
  if (!customizations) return "None";
  
  const labels: Record<string, string> = {
    wheelType: "Wheels",
    headlightType: "Headlights",
    bumperType: "Bumper",
    spoilerType: "Spoiler",
    decalType: "Decal",
  };

  const items = [];
  
  if (customizations.bodyColor) {
    const colorName = colorNames[customizations.bodyColor] || customizations.bodyColor;
    items.push(`<li><strong>Body Color:</strong> ${colorName}</li>`);
  }
  
  for (const [key, value] of Object.entries(customizations)) {
    if (key !== "bodyColor" && value && value !== "none" && value !== "standard") {
      items.push(`<li><strong>${labels[key] || key}:</strong> ${value}</li>`);
    }
  }
  
  return items.length > 0 ? `<ul>${items.join("")}</ul>` : "Standard configuration";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuoteRequest = await req.json();

    if (!data.customerName || !data.customerPhone || !data.customerEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isCustomizer = data.requestType === "customizer";
    const subject = isCustomizer 
      ? `New 3D Customization Quote Request - ${data.carBrand} ${data.carModel}`
      : `New Service Estimate Request - ${data.carBrand} ${data.carModel}`;

    const customizationSection = isCustomizer
      ? `
        <h3>Customization Details:</h3>
        ${formatCustomizations(data.customizations)}
      `
      : `
        <h3>Selected Services:</h3>
        <ul>
          ${data.selectedServices?.map(s => `<li>${s}</li>`).join("") || "None selected"}
        </ul>
      `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e63946;">New Quote Request</h1>
        <h2 style="color: #1d3557;">Customer Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.customerPhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.customerEmail}</td>
          </tr>
        </table>

        <h2 style="color: #1d3557; margin-top: 24px;">Vehicle Details</h2>
        <p><strong>Brand:</strong> ${data.carBrand || "Not specified"}</p>
        <p><strong>Model:</strong> ${data.carModel || "Not specified"}</p>

        ${customizationSection}

        <h2 style="color: #1d3557; margin-top: 24px;">Estimated Price</h2>
        <p style="font-size: 24px; color: #e63946; font-weight: bold;">
          ₹${data.estimatedPrice.toLocaleString("en-IN")}
        </p>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          This quote request was submitted from the CarMods website.
        </p>
      </div>
    `;

    // Validate admin email is set
    if (!adminEmail) {
      console.error("ADMIN_EMAIL not configured");
      return new Response(
        JSON.stringify({ error: "Admin email not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending email to:", adminEmail);

    const emailResponse = await resend.emails.send({
      from: "CarMods <onboarding@resend.dev>",
      to: [adminEmail],
      subject: subject,
      html: emailHtml,
    });

    console.log("Resend response:", JSON.stringify(emailResponse));

    // Check if Resend returned an error
    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: emailResponse.error.message,
          details: "For testing, verify your domain at resend.com/domains"
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-quote-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
