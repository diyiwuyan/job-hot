import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '央国企投递导航 - JOBHOT',
  description:
    '面向升学与就业咨询场景的央国企投递导航工具，支持学生画像、企业地图、26届招聘复盘、地域图谱和备考档案。',
};

export default function SoeDeliveryPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>央国企投递导航</h1>
        <p>按学生专业、学历、院校层次和城市偏好，快速定位可投企业、岗位方向、26届招聘复盘和备考资料。</p>
      </div>

      <section className={styles.toolShell} aria-label="央国企投递导航工具">
        <iframe
          className={styles.toolFrame}
          src="/soe-delivery/index.html"
          title="央国企投递导航"
          loading="eager"
        />
      </section>
    </div>
  );
}
