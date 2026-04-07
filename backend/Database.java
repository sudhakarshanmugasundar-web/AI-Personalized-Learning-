import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Simulates a database containing the 'users' table.
 */
public class Database {
    
    // Simulates "users" table
    private static final Map<String, Map<String, String>> usersTable = new LinkedHashMap<>();
    private static int nextId = 1;

    /**
     * Attempts to register a new user in the database.
     * @return true if successful, false if email already exists
     */
    public static boolean registerUser(String name, String email, String password) {
        if (usersTable.containsKey(email)) {
            return false;
        }

        Map<String, String> userRecord = new HashMap<>();
        userRecord.put("id", String.valueOf(nextId++));
        userRecord.put("name", name);
        userRecord.put("email", email);
        userRecord.put("password", password);
        userRecord.put("created_at", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        usersTable.put(email, userRecord);
        return true;
    }

    /**
     * Checks if an email is already registered.
     */
    public static boolean userExists(String email) {
        return usersTable.containsKey(email);
    }

    /**
     * Checks if a given email and password combination is valid.
     * @return The user's name if valid, null otherwise.
     */
    public static String authenticate(String email, String password) {
        Map<String, String> user = usersTable.get(email);
        if (user != null && user.get("password").equals(password)) {
            return user.get("name");
        }
        return null;
    }

    /**
     * Returns a user record by email, or null if not found.
     */
    public static Map<String, String> getUserByEmail(String email) {
        return usersTable.get(email);
    }
}
