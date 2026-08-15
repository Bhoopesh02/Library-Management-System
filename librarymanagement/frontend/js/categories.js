const BookCategories = [
    {
        group: "Core Engineering Subjects",
        options: [
            "Mathematics",
            "Physics",
            "Chemistry"
        ]
    },
    {
        group: "Computer Science & IT Tracks",
        options: [
            "Programming Languages",
            "Algorithms and Data Structures",
            "Software Engineering",
            "Web and Mobile Development",
            "Data Science and AI",
            "Cybersecurity and Networking",
            "Database Systems"
        ]
    },
    {
        group: "Allied Engineering Fields",
        options: [
            "Electronics and Hardware",
            "Mechanical and Civil"
        ]
    },
    {
        group: "Competitive Exam Prep",
        options: [
            "GATE Exam",
            "Coding Interview Prep"
        ]
    },
    {
        group: "Fiction",
        options: [
            "Romance",
            "Mystery and Thriller",
            "Science Fiction and Fantasy",
            "Historical Fiction",
            "Literary Fiction",
            "Horror"
        ]
    },
    {
        group: "Non-Fiction",
        options: [
            "Biography and Memoir",
            "Self-Help and Personal Growth",
            "History",
            "Business and Economics",
            "Cookbooks and Food",
            "Science and Nature"
        ]
    },
    {
        group: "Young Readers & Special Categories",
        options: [
            "Children's Books",
            "Young Adult (YA)",
            "Comics and Graphic Novels",
            "Poetry"
        ]
    }
];

function generateCategoryOptions(includeAllOption = false, currentLegacyCategory = null) {
    let html = '';
    
    if (includeAllOption) {
        html += '<option value="">All Categories</option>';
    } else {
        html += '<option value="">Select a category</option>';
    }

    if (currentLegacyCategory && !isCategoryValid(currentLegacyCategory)) {
        html += `<option value="${currentLegacyCategory}" disabled>Legacy: ${currentLegacyCategory}</option>`;
    }

    BookCategories.forEach(categoryGroup => {
        html += `<optgroup label="${categoryGroup.group}">`;
        categoryGroup.options.forEach(option => {
            html += `<option value="${option}">${option}</option>`;
        });
        html += `</optgroup>`;
    });

    return html;
}

function isCategoryValid(category) {
    if (!category) return false;
    for (const group of BookCategories) {
        if (group.options.includes(category)) {
            return true;
        }
    }
    return false;
}
