import {
  useColorScheme,
  type ColorScheme,
} from '@/components/theme/color-scheme-context';
import { cn } from '@/lib/utils';

const schemes: Array<{ value: ColorScheme; label: string; color: string }> = [
  { value: 'azure', label: 'Azure', color: '#2F6FED' },
  { value: 'citrus', label: 'Citrus', color: '#F59E0B' },
  { value: 'slate', label: 'Slate', color: '#334155' },
  { value: 'rose', label: 'Rose', color: '#E11D48' },
];

const ColorSchemeToggle = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <div className="border-border bg-card flex items-center gap-1 rounded-md border px-1 py-1">
      {schemes.map(scheme => {
        const isActive = colorScheme === scheme.value;
        return (
          <button
            key={scheme.value}
            type="button"
            onClick={() => setColorScheme(scheme.value)}
            className={cn(
              'flex items-center gap-2 rounded px-2 py-1 text-xs transition',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={isActive}
            aria-label={`切换主题色：${scheme.label}`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: scheme.color }}
            />
            <span className="hidden sm:inline">{scheme.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ColorSchemeToggle;
