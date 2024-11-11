const importAllPages = (requireContext) => {
  return requireContext.keys().reduce((acc, path) => {
    const key = path.replace('./', '').replace(/\.[^/.]+$/, '');
    acc[key] = requireContext(path).default;
    return acc;
  }, {});
};

export default importAllPages;
