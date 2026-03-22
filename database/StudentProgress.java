import java.util.HashMap;
import java.util.Map;

public class StudentProgress {

    // Structure: Username -> (CourseID -> Max Unlocked Level)
    private static final Map<String, Map<String, Integer>> userProgress = new HashMap<>();
    
    // Structure: Username -> (StatName -> Value)
    private static final Map<String, Map<String, Object>> userStats = new HashMap<>();

    public static int getUnlockedLevel(String user, String course) {
        if (!userProgress.containsKey(user)) return 1;
        if (!userProgress.get(user).containsKey(course)) return 1;
        return userProgress.get(user).get(course);
    }

    public static void completeLevel(String user, String course, int completedLevel) {
        userProgress.putIfAbsent(user, new HashMap<>());
        int currentMax = getUnlockedLevel(user, course);
        
        int maxLevels = 5;
        if (course.equals("java")) maxLevels = 7;
        if (course.equals("python")) maxLevels = 6;
        
        if (completedLevel >= currentMax && currentMax < maxLevels) {
            userProgress.get(user).put(course, completedLevel + 1);
            System.out.println("User " + user + " unlocked Level " + (completedLevel + 1) + " in " + course);
        }
    }

    public static void saveScore(String user, String course, int level, int score, boolean correct) {
        System.out.println("Saving score for " + user + " on " + course + " L" + level + ": " + score);
        userStats.putIfAbsent(user, new HashMap<>());
        Map<String, Object> stats = userStats.get(user);
        
        int totalAttempted = (int) stats.getOrDefault("topicsCompleted", 0) + 1;
        stats.put("topicsCompleted", totalAttempted);
        
        int currentScore = (int) stats.getOrDefault("totalScore", 0);
        stats.put("totalScore", currentScore + score);
        
        int totalQuestions = (int) stats.getOrDefault("totalQuestions", 0) + 1;
        stats.put("totalQuestions", totalQuestions);
        
        int correctAnswers = (int) stats.getOrDefault("correctAnswers", 0) + (correct ? 1 : 0);
        stats.put("correctAnswers", correctAnswers);
        
        int streak = (int) stats.getOrDefault("streak", 0);
        if (correct) {
            stats.put("streak", streak + 1);
        } else {
            stats.put("streak", 0);
        }
        
        // Calculate accuracy
        double accuracy = ((double) correctAnswers / totalQuestions) * 100;
        stats.put("accuracy", (int) accuracy);
        
        stats.put("activeCourse", course);
        stats.put("activeLevel", level);
    }
    
    public static Map<String, Object> getProfileView(String user) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user);
        
        Map<String, Integer> courses = userProgress.getOrDefault(user, new HashMap<>());
        int enrolled = courses.size();
        int completed = 0;
        int totalLevelsUnlocked = 0;
        
        for (Map.Entry<String, Integer> entry : courses.entrySet()) {
            String courseId = entry.getKey();
            int lvl = entry.getValue();
            
            int cMax = 5;
            if (courseId.equals("java")) cMax = 7;
            if (courseId.equals("python")) cMax = 6;
            
            if (lvl > cMax) completed++;
            totalLevelsUnlocked += lvl - 1; 
        }
        if (enrolled == 0) enrolled = 1; // Default
        
        Map<String, Object> stats = userStats.getOrDefault(user, new HashMap<>());
        
        profile.put("enrolled", enrolled);
        profile.put("completedCourses", completed);
        profile.put("activeCourse", stats.getOrDefault("activeCourse", "Java Programming"));
        profile.put("activeLevel", stats.getOrDefault("activeLevel", 1));
        
        int topicsCompleted = (int) stats.getOrDefault("topicsCompleted", totalLevelsUnlocked);
        int remainingTopics = (18) - topicsCompleted; // 7 + 6 + 5 = 18 topics total
        if (remainingTopics < 0) remainingTopics = 0;
        
        profile.put("topicsCompleted", topicsCompleted);
        profile.put("remainingTopics", remainingTopics);
        
        int progressPercent = (int) (((double)topicsCompleted / 18.0) * 100.0);
        if (progressPercent > 100) progressPercent = 100;
        profile.put("progressPercent", progressPercent);
        
        profile.put("accuracy", stats.getOrDefault("accuracy", 0));
        profile.put("score", stats.getOrDefault("totalScore", 0));
        profile.put("streak", stats.getOrDefault("streak", 0));
        
        return profile;
    }
}
