import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public class ChatService {

    private static final String API_KEY = System.getenv("OPENAI_API_KEY");

    public static String getAIResponse(String userMessage) {
        try {
            URL url = new URL("https://api.openai.com/v1/chat/completions");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // Simple JSON escape for user message
            String escapedMessage = userMessage.replace("\\", "\\\\").replace("\"", "\\\"");

            String jsonInput = "{"
                    + "\"model\":\"gpt-4o-mini\","
                    + "\"messages\":["
                    + "{\"role\":\"system\",\"content\":\"You are an AI tutor for Java, Python, and Spoken English. Explain simply with examples.\"},"
                    + "{\"role\":\"user\",\"content\":\"" + escapedMessage + "\"}"
                    + "]}";

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInput.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int code = conn.getResponseCode();
            InputStream is = (code >= 200 && code < 300) ? conn.getInputStream() : conn.getErrorStream();
            
            try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                String response = br.lines().collect(Collectors.joining("\n"));
                
                if (code != 200) {
                    System.err.println("OpenAI Error " + code + ": " + response);
                    return "Error: OpenAI returned " + code;
                }
                
                // Parse simple reply from JSON
                return extractReply(response);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "Error connecting to AI backend: " + e.getMessage();
        }
    }

    private static String extractReply(String json) {
        try {
            int start = json.indexOf("\"content\": \"") + 12;
            if (start < 12) start = json.indexOf("\"content\":\"") + 11;
            int end = json.indexOf("\"", start);
            
            // Handle escaped characters manually for the simple parser
            String content = json.substring(start, end);
            return content.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
        } catch (Exception e) {
            return "Error parsing AI response";
        }
    }
}
