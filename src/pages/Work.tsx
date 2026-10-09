import { t } from '../content';
import { ProjectCards } from '../components/ProjectCards';
import { StopTag } from '../components/StopTag';

export default function Work() {
  return (
    <div className="container page">
      <header className="page-head">
        <StopTag href="/work" mode="stop" />
        <p className="label">{t('work', 'intro.eyebrow')}</p>
        <h1>{t('work', 'intro.h1')}</h1>
        <p className="lede">{t('work', 'intro.text')}</p>
      </header>
      <ProjectCards onWorkPage />
    </div>
  );
}
