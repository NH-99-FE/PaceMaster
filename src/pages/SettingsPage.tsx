import { QuestionTypeSection } from '@/features/settings/components/QuestionTypeSection';
import { TemplateSection } from '@/features/settings/components/TemplateSection';
import { useSettingsData } from '@/features/settings/hooks/useSettingsData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTransferSection } from '@/features/settings/components/DataTransferSection';

const SettingsPage = () => {
  useSettingsData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">设置</h1>
        <p className="text-muted-foreground text-sm">
          维护题型与模板，保证练习与复盘的数据一致性。
        </p>
      </div>

      {/* 移动端使用 Tab 收敛布局，桌面端保持并列管理面板。 */}
      <div className="md:hidden">
        <Tabs defaultValue="types" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="types">题型管理</TabsTrigger>
            <TabsTrigger value="templates">模板管理</TabsTrigger>
          </TabsList>
          <TabsContent value="types">
            <QuestionTypeSection />
          </TabsContent>
          <TabsContent value="templates">
            <TemplateSection />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden gap-4 md:grid lg:grid-cols-[1fr_1fr]">
        <QuestionTypeSection />
        <TemplateSection />
      </div>

      <DataTransferSection />
    </div>
  );
};

export default SettingsPage;
