'use client';

import styles from './page.module.css';

export function SoeDeliveryTool() {
  return (
    <div className={`soe-delivery-page ${styles.page}`}>
      <header className={styles.compactHeader}>
        <div>
          <span>央国企服务 · 管理员内部工具</span>
          <h1>投递导航</h1>
        </div>
        <p>按学生画像快速定位可投企业、岗位方向、招聘复盘和备考资料。</p>
      </header>

      <section className={styles.toolShell} aria-label="内部投递导航工具">
        <iframe
          className={styles.toolFrame}
          src="/soe-delivery/index.html?embed=jobhot"
          title="内部投递导航"
          loading="eager"
        />
      </section>
    </div>
  );
}
