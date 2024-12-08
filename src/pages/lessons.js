import React, { useState, useEffect } from "react";
import "../styles/lessons.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/usercontext";
import { firestore } from "../config/firebase-config";
import { getDoc, setDoc, doc } from "firebase/firestore";
import LessonCard from "../components/lessoncard";
import LessonCardSkeleton from "../skeletons/lessoncardskeleton";

const Lessons = () => {
  const navigate = useNavigate();
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isLessonsLoading, setIsLessonsLoading] = useState(true);
  const [categorizedLessons, setCategorizedLessons] = useState({
    dataStructures: [],
    algorithms: [],
    concepts: [],
  });
  const [loadedImages, setLoadedImages] = useState({});
  const { user, premiumInfo } = useUser();

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCompletedQuizzes(userData.completedQuizzes || {});
            setCompletedLessons(userData.completedLessons || {});
          } else {
            setDoc(userRef, { completedQuizzes: {}, completedLessons: {} });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        })
        .finally(() => setIsUserLoading(false));
    } else {
      setCompletedQuizzes([]);
      setCompletedLessons([]);
      setIsUserLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const lessonsData = await import("../content/lessons.json");
        const categorized = {
          dataStructures: [],
          algorithms: [],
          concepts: [],
        };
        lessonsData.default.forEach((lesson) => {
          if (lesson.type === "datastructure") {
            categorized.dataStructures.push(lesson);
          } else if (lesson.type === "algorithm") {
            categorized.algorithms.push(lesson);
          } else if (lesson.type === "concept") {
            categorized.concepts.push(lesson);
          }
        });
        setCategorizedLessons(categorized);
      } catch (error) {
        console.error("Error loading lessons.json: ", error);
      } finally {
        setIsLessonsLoading(false);
      }
    };
    loadLessons();
  }, []);

  const handleImageLoad = (title) => {
    setLoadedImages((prev) => ({
      ...prev,
      [title]: true,
    }));
  };

  const isLoading = isUserLoading || isLessonsLoading;

  const handleLessonClick = (lesson) => {
    if (lesson.premium && !premiumInfo.premium) return;
    navigate(`/lesson/${lesson.title.replaceAll(" ", "-").toLowerCase()}`);
  };

  const handleQuizClick = (quiz) => {
    navigate(`/quiz/${quiz.title.replaceAll(" ", "-").toLowerCase()}`);
  };

  const renderLessons = (category, title) => {
    const skeletonCount =
      title === "Data Structures" ? 17 : title === "Algorithms" ? 6 : 8;
  
    return (
      <div key={title}>
        <p className="lesson-type-title">{title}</p>
        <div className="lessons-container">
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <LessonCardSkeleton key={index} />
              ))
            : category.map((lesson, index) => (
                <LessonCard
                  key={index}
                  lesson={lesson}
                  image={require(`../content/images/${lesson.title
                    .replace(/\s|-/g, "")
                    .toLowerCase()}.webp`)}
                  loadedImage={!!loadedImages[lesson.title]}
                  handleImageLoad={handleImageLoad}
                  handleLessonClick={handleLessonClick}
                  handleQuizClick={handleQuizClick}
                  completedLessons={completedLessons}
                  completedQuizzes={completedQuizzes}
                  premiumInfo={premiumInfo}
                  titleClass={title.toLowerCase().split(" ").join("-")}
                />
              ))}
        </div>
      </div>
    );
  };  

  return (
    <div className="lesson-types">
      {renderLessons(categorizedLessons.dataStructures, "Data Structures")}
      {renderLessons(categorizedLessons.algorithms, "Algorithms")}
      {renderLessons(categorizedLessons.concepts, "Concepts")}
    </div>
  );
};

export default Lessons;