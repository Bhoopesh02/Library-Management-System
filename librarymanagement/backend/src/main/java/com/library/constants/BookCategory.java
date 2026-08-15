package com.library.constants;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class BookCategory {
    public static final Set<String> ALLOWED_CATEGORIES = new HashSet<>(Arrays.asList(
            "Mathematics",
            "Physics",
            "Chemistry",
            "Programming Languages",
            "Algorithms and Data Structures",
            "Software Engineering",
            "Web and Mobile Development",
            "Data Science and AI",
            "Cybersecurity and Networking",
            "Database Systems",
            "Electronics and Hardware",
            "Mechanical and Civil",
            "GATE Exam",
            "Coding Interview Prep",
            "Romance",
            "Mystery and Thriller",
            "Science Fiction and Fantasy",
            "Historical Fiction",
            "Literary Fiction",
            "Horror",
            "Biography and Memoir",
            "Self-Help and Personal Growth",
            "History",
            "Business and Economics",
            "Cookbooks and Food",
            "Science and Nature",
            "Children's Books",
            "Young Adult (YA)",
            "Comics and Graphic Novels",
            "Poetry"
    ));

    public static boolean isValid(String category) {
        return category != null && ALLOWED_CATEGORIES.contains(category);
    }
}
