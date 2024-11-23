import React, { useState, useEffect } from "react";
import "../styles/lessons.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/usercontext";
import { firestore } from "../config/firebase-config";
import { getDoc, setDoc, doc } from "firebase/firestore";

const Lessons = ({ lessons }) => {
  const navigate = useNavigate();
  const { premiumInfo } = useUser();
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const categorizedLessons = {
    dataStructures: [],
    algorithms: [],
    concepts: [],
  };
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCompletedQuizzes(userData.completedQuizzes || {});
          } else {
            setDoc(userRef, { completedQuizzes: {} });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      setCompletedQuizzes({});
    }
  }, [user]);

  const images = lessons.reduce((map, lesson) => {
    map[lesson.title] = require(
      `../content/images/${lesson.title.replace(/\s|-/g, "").toLowerCase()}.webp`
    );
    return map;
  }, {});

  lessons.forEach((lesson) => {
    if (lesson.type === "datastructure") {
      categorizedLessons.dataStructures.push(lesson);
    } else if (lesson.type === "algorithm") {
      categorizedLessons.algorithms.push(lesson);
    } else if (lesson.type === "concept") {
      categorizedLessons.concepts.push(lesson);
    }
  });

  const [loadedImages, setLoadedImages] = useState(
    Array(lessons.length).fill(false)
  );

  const handleImageLoad = (index) => {
    setLoadedImages((prevLoadedImages) => {
      const newLoadedImages = [...prevLoadedImages];
      newLoadedImages[index] = true;
      return newLoadedImages;
    });
  };

  const handleLessonClick = (lesson) => {
    if (lesson.premium && !premiumInfo.premium) return;
    navigate(`/lesson/${lesson.title.replaceAll(" ", "-").toLowerCase()}`);
  };

  const handleQuizClick = (quiz) => {
    navigate(`/quiz/${quiz.title.replaceAll(" ", "-").toLowerCase()}`);
  };

  const renderLessons = (category, title) => (
    <div key={title}>
      <p className="lesson-type-title">{title}</p>
      <div className="lessons-container">
        {category.map((lesson, index) => (
          <div key={index} className="lesson-card">
            <div
              className={`lesson-card-image-container ${title.toLowerCase().split(" ").join("-")}`}
            >
              <img
                className={`lesson-card-image ${loadedImages[index] ? "loaded" : "blurred"}`}
                src={images[lesson.title]}
                alt={lesson.title}
                onLoad={() => handleImageLoad(index)}
              />
            </div>
            <div className="lesson-card-text">
              <p className="lesson-card-title">{lesson.title}</p>
              <p className={"lesson-card-difficulty " + lesson.difficulty}>
                {lesson.difficulty[0].toUpperCase() +
                  lesson.difficulty.slice(1) || "N/A"}
              </p>
              <div className="lesson-card-buttons">
                <button
                  className={`lesson-card-button ${lesson.premium && !premiumInfo.premium ? "disabled" : ""}`}
                  onClick={() => handleLessonClick(lesson)}
                >
                  Lesson
                  {lesson.premium && <i className="fa-solid fa-rocket"></i>}
                </button>
                <button
                  className="lesson-card-button"
                  onClick={() => handleQuizClick(lesson)}
                >
                  Quiz{" "}
                  {completedQuizzes[lesson.title] && (
                    <i className="fa-solid fa-check-circle"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="lesson-types">
      {renderLessons(categorizedLessons.dataStructures, "Data Structures")}
      {renderLessons(categorizedLessons.algorithms, "Algorithms")}
      {renderLessons(categorizedLessons.concepts, "Concepts")}
    </div>
  );
};

export default Lessons;
