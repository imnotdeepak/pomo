import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Timer, LayoutGrid, Music2, BarChart3, Settings2, Flame } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Everything in one place.</h2>
                    <p className="mt-4 text-muted-foreground">All the tools you need to build a deep work habit.</p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16 md:grid-cols-3 md:max-w-full">
                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Timer className="size-6" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium">Focus Timer</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Circular Pomodoro timer with customizable focus and break durations to keep you on track.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <LayoutGrid className="size-6" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium">Task Board</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Drag-and-drop Kanban board with To Do, In Progress, and Done columns synced to your account.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Music2 className="size-6" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium">Ambient Sounds</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Rain, brown noise, classical, and more. Fine-tune volume to build your perfect focus environment.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <BarChart3 className="size-6" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium">Progress Tracking</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">60-day activity heatmap, daily totals, and all-time focus hours to visualize your growth.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Settings2 className="size-6" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium">Customizable</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Adjust session lengths, break intervals, and alarm sounds to perfectly fit your workflow.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Flame className="size-6" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium">Streaks</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Build momentum with daily streaks and habit tracking that keep you coming back every day.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
        />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)
