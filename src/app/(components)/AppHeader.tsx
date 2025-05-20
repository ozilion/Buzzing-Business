import { ThemeToggle } from '@/app/(components)/ThemeToggle';
import { Leaf } from 'lucide-react'; // Using Leaf as a placeholder for a bee/nature related icon

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Leaf className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Buzzing Business
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
