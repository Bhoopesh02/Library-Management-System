export const BookCategories = [
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

export const isCategoryValid = (category) => {
  if (!category) return false;
  return BookCategories.some(group => group.options.includes(category));
};
