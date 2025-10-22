export default function AboutPage() {
  return (
    <div className="space-y-8 rounded-3xl bg-white/90 p-8 shadow-card">
      <h1 className="text-3xl font-bold text-forest">О проекте Petlify</h1>
      <p className="text-base text-forest/80">
        Petlify помогает людям в Беларуси быстрее возвращать пропавших питомцев домой. Мы объединяем владельцев, волонтёров и
        неравнодушных очевидцев в одной экосистеме с лентой объявлений, картой, замечаниями и уведомлениями по радиусу.
      </p>
      <p className="text-base text-forest/80">
        Проект работает на базе PocketBase и Next.js. Данные синхронизируются в реальном времени, а уведомления приходят в
        браузер благодаря Firebase Cloud Messaging.
      </p>
    </div>
  );
}
