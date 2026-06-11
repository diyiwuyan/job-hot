// 求职导航数据：按分类组织的常用求职网站集合
// 数据来源：精选官方招聘平台、国央企、互联网大厂、地方人社、求职工具等

export interface NavSite {
  name: string;
  url: string;
  desc?: string;
}

export interface NavCategory {
  category: string;
  sites: NavSite[];
}

export const NAV_DATA: NavCategory[] = [
  {
    category: '官方招聘平台',
    sites: [
      { name: '应届生求职网', url: 'https://www.yingjiesheng.com/' },
      { name: '前程无忧(校招)', url: 'https://campus.51job.com/' },
      { name: '智联招聘(校招)', url: 'https://campus.zhaopin.com/' },
      { name: '猎聘校园', url: 'https://campus.liepin.com/' },
      { name: 'BOSS直聘', url: 'https://www.zhipin.com/' },
      { name: '实习僧', url: 'https://www.shixiseng.com/' },
      { name: '牛客网(求职)', url: 'https://www.nowcoder.com/' },
      { name: '海投网', url: 'https://www.haitou.cc/' },
      { name: '梧桐果', url: 'https://www.wutongguo.com/' },
    ],
  },
  {
    category: '国央企&公务员',
    sites: [
      { name: '国家公务员局', url: 'http://www.scs.gov.cn/' },
      { name: '中国人事考试网', url: 'http://www.cpta.com.cn/' },
      { name: '国资委招聘', url: 'http://www.sasac.gov.cn/' },
      { name: '中国银行招聘', url: 'https://campus.chinahr.com/' },
      { name: '国家电网招聘', url: 'http://zhaopin.sgcc.com.cn/' },
      { name: '中国烟草招聘', url: 'https://www.tobaccochina.com/' },
      { name: '各省选调生', url: 'https://www.yingjiesheng.com/xuandiaosheng/' },
      { name: '事业单位招聘', url: 'http://www.shiyebian.net/' },
    ],
  },
  {
    category: '互联网大厂',
    sites: [
      { name: '腾讯招聘', url: 'https://join.qq.com/' },
      { name: '阿里巴巴招聘', url: 'https://talent.alibaba.com/' },
      { name: '字节跳动招聘', url: 'https://jobs.bytedance.com/' },
      { name: '美团招聘', url: 'https://zhaopin.meituan.com/' },
      { name: '京东招聘', url: 'https://campus.jd.com/' },
      { name: '百度招聘', url: 'https://talent.baidu.com/' },
      { name: '华为招聘', url: 'https://career.huawei.com/' },
      { name: '小米招聘', url: 'https://hr.xiaomi.com/' },
      { name: '网易招聘', url: 'https://campus.163.com/' },
      { name: '快手招聘', url: 'https://zhaopin.kuaishou.cn/' },
      { name: '滴滴招聘', url: 'https://talent.didiglobal.com/' },
      { name: '拼多多招聘', url: 'https://careers.pinduoduo.com/' },
    ],
  },
  {
    category: '地方人才&社保',
    sites: [
      { name: '北京人社局', url: 'http://rsj.beijing.gov.cn/' },
      { name: '上海人社局', url: 'http://rsj.sh.gov.cn/' },
      { name: '广州人社局', url: 'http://rsj.gz.gov.cn/' },
      { name: '深圳人社局', url: 'http://hrss.sz.gov.cn/' },
      { name: '杭州人社局', url: 'http://hrss.hangzhou.gov.cn/' },
      { name: '成都人社局', url: 'http://cdhrss.chengdu.gov.cn/' },
      { name: '南京人社局', url: 'http://rsj.nanjing.gov.cn/' },
      { name: '武汉人社局', url: 'http://rsj.wuhan.gov.cn/' },
    ],
  },
  {
    category: '求职工具&资源',
    sites: [
      { name: '超级简历', url: 'https://www.wondercv.com/' },
      { name: '知页简历', url: 'https://www.zhiyeapp.com/' },
      { name: '看准网(薪资)', url: 'https://www.kanzhun.com/' },
      { name: '职友集(薪资)', url: 'https://www.jobui.com/' },
      { name: 'OfferShow', url: 'https://offershow.cn/' },
      { name: '脉脉(职场社交)', url: 'https://maimai.cn/' },
      { name: '领英LinkedIn', url: 'https://www.linkedin.com/' },
      { name: 'LeetCode(刷题)', url: 'https://leetcode.cn/' },
      { name: '牛客面经', url: 'https://www.nowcoder.com/discuss' },
    ],
  },
];

/** 把完整 URL 格式化为简洁的域名提示 */
export function formatNavUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
