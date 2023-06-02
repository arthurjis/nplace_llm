import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import detectLanguage from './detectLanguage';

function RedirectWithLang({ to }) {
  const navigate = useNavigate();
  const language = detectLanguage();

  useEffect(() => {
    navigate(`/${language}${to}`);
  }, [navigate, to, language]);

  // Return null because RedirectWithLang does not render a component
  return null;
}

export default RedirectWithLang;
