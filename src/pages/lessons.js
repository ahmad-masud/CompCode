import React, { useState } from 'react';
import '../styles/lessons.css';
import { useNavigate } from 'react-router-dom';

const Lessons = ({ lessons, premiumInfo }) => {
  const navigate = useNavigate();
  const categorizedLessons = {
    dataStructures: [],
    algorithms: [],
    concepts: [],
  };

  const images = lessons.reduce((map, lesson) => {
    map[lesson.title] = require(`../content/images/${lesson.title.replace(/\s|-/g, '').toLowerCase()}.webp`);
    return map;
  }, {});

  lessons.forEach((lesson) => {
    if (lesson.type === 'datastructure') {
      categorizedLessons.dataStructures.push(lesson);
    } else if (lesson.type === 'algorithm') {
      categorizedLessons.algorithms.push(lesson);
    } else if (lesson.type === 'concept') {
      categorizedLessons.concepts.push(lesson);
    }
  });

  const [loadedImages, setLoadedImages] = useState(Array(lessons.length).fill(false));

  const handleImageLoad = (index) => {
    setLoadedImages((prevLoadedImages) => {
      const newLoadedImages = [...prevLoadedImages];
      newLoadedImages[index] = true;
      return newLoadedImages;
    });
  };

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
            onClick={() => handleClick(lesson)}
            key={index}
            className={`lesson-card ${lesson.premium && !premiumInfo.premium ? 'lesson-card-disabled' : ''}`}
          >
            <div className={`lesson-card-image-container ${title.toLowerCase().split(' ').join('-')}`}>
              <img
                className={`lesson-card-image ${loadedImages[index] ? 'loaded' : 'blurred'}`}
                src={images[lesson.title]}
                alt={lesson.title}
                onLoad={() => handleImageLoad(index)}
              />
            </div>
            <div className="lesson-card-text">
              <p className="lesson-card-title">{lesson.title}</p>
              <div className="lesson-card-sub-text">
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