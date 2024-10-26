import React, { useEffect, useRef, useState } from 'react';
import '../styles/lessons.css';
import { useNavigate } from 'react-router-dom';
import loadingImage from '../content/images/loading.webp';

const Lessons = ({ lessons, premiumInfo }) => {
  const navigate = useNavigate();
  const categorizedLessons = {
    dataStructures: [],
    algorithms: [],
    concepts: [],
  };

  const observer = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    setLoadedImages({}); // Reset images on component mount
    if (!observer.current) {
      observer.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const { title } = entry.target.dataset;
            setLoadedImages((prev) => ({
              ...prev,
              [title]: require(`../content/images/${title.replace(/\s|-/g, '').toLowerCase()}.webp`),
            }));
            observer.current.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
    }
    return () => observer.current && observer.current.disconnect();
  }, []);

  lessons.forEach((lesson) => {
    if (lesson.type === 'datastructure') {
      categorizedLessons.dataStructures.push(lesson);
    } else if (lesson.type === 'algorithm') {
      categorizedLessons.algorithms.push(lesson);
    } else if (lesson.type === 'concept') {
      categorizedLessons.concepts.push(lesson);
    }
  });

  const handleClick = (lesson) => {
    if (lesson.premium && !premiumInfo.premium) return;
    navigate(`/lesson/${lesson.title.replaceAll(' ', '-').toLowerCase()}`);
  };

  const renderLessons = (category, title) => (
    <div key={title}>
      <p className='lesson-type-title'>{title}</p>
      <div className="lessons-container">
        {category.map((lesson, index) => (
          <div
            ref={(el) => {
              if (el && observer.current) {
                observer.current.observe(el);
              }
            }}
            data-title={lesson.title}
            onClick={() => handleClick(lesson)}
            key={index}
            className={`lesson-card ${lesson.premium && !premiumInfo.premium ? 'lesson-card-disabled' : ''}`}
          >
            <img
              className={`lesson-card-image ${loadedImages[lesson.title] ? 'loaded' : 'loading'}`}
              src={loadedImages[lesson.title] || loadingImage}
              alt={lesson.title}
              loading="lazy"
            />
            <div className="lesson-card-text">
              <p className="lesson-card-title">{lesson.title}</p>
              <div className="lesson-card-sub-text">
                <p className='lesson-card-duration'>{lesson.duration || 'N/A'}</p>
                <p className={'lesson-card-difficulty ' + lesson.difficulty}>
                  {lesson.difficulty[0].toUpperCase() + lesson.difficulty.slice(1) || 'N/A'}
                </p>
                {lesson.premium && <i className="fa-solid fa-crown"></i>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className='lesson-types'>
      {renderLessons(categorizedLessons.dataStructures, 'Data Structures')}
      {renderLessons(categorizedLessons.algorithms, 'Algorithms')}
      {renderLessons(categorizedLessons.concepts, 'Concepts')}
    </div>
  );
};

export default Lessons;