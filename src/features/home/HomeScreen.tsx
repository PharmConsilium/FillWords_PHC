import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button/Button';
import styles from './HomeScreen.module.css';

export const HomeScreen = () => (
  <main className={styles.page}>
    <section className={styles.card}>
      <p className={styles.badge}>PharmConsilium</p>
      <h1 className={styles.title}>FillWords</h1>
      <p className={styles.subtitle}>
        Филворды с тематикой здоровья и лекарств. Соберите слова на сетке и отмечайте найденные.
      </p>
      <Link to="/play/demo-1" className={styles.playLink}>
        <Button>Играть (демо)</Button>
      </Link>
    </section>
  </main>
);
