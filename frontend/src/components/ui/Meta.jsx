import { Helmet } from 'react-helmet-async';

// Per-page title + meta description (see design docs — react-helmet-async)
const Meta = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} | Nordstroma` : 'Nordstroma — Shop Electronics, Clothing & More'}</title>
    {description && <meta name="description" content={description} />}
  </Helmet>
);

export default Meta;
