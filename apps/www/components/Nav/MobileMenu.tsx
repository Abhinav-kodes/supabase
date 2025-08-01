import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'

import { Accordion, Button, TextLink } from 'ui'
import { DEFAULT_EASE } from '~/lib/animations'
import MenuItem from './MenuItem'

import { useIsLoggedIn, useIsUserLoading } from 'common'
import * as supabaseLogoWordmarkDark from 'common/assets/images/supabase-logo-wordmark--dark.png'
import * as supabaseLogoWordmarkLight from 'common/assets/images/supabase-logo-wordmark--light.png'
import { ChevronRight } from 'lucide-react'
import { useKey } from 'react-use'
import staticContent from '~/.contentlayer/generated/staticContent/_index.json' with { type: 'json' }
import ProductModulesData from '~/data/ProductModules'

import { useSendTelemetryEvent } from '~/lib/telemetry'

const { jobsCount } = staticContent

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  menu: any
}

const MobileMenu = ({ open, setOpen, menu }: Props) => {
  const isLoggedIn = useIsLoggedIn()
  const isUserLoading = useIsUserLoading()
  const sendTelemetryEvent = useSendTelemetryEvent()
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.15, staggerChildren: 0.05, ease: DEFAULT_EASE } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  }

  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: DEFAULT_EASE } },
    exit: { opacity: 0, transition: { duration: 0.05 } },
  }

  useKey('Escape', () => setOpen(false))

  const AccordionMenuItem = ({ menuItem }: any) => (
    <>
      {menuItem.title === 'Product' ? (
        <>
          {Object.values(menuItem.subMenu)?.map((component: any) => (
            <MenuItem
              key={component.name}
              title={component.name}
              href={component.url}
              description={component.description_short}
              icon={component.icon}
            />
          ))}
          <div>
            <div className="group flex items-center p-2 text-foreground-lighter text-xs uppercase tracking-widest font-mono">
              Modules
            </div>
            <ul className="flex flex-col gap-0">
              {Object.values(ProductModulesData).map((productModule) => (
                <MenuItem
                  key={productModule.name}
                  title={productModule.name}
                  href={productModule.url}
                  description={productModule.description_short}
                  icon={productModule.icon}
                />
              ))}
            </ul>
          </div>
          <Link
            href="/features"
            className="
              flex items-center justify-between group text-sm
              p-4 mt-4 gap-2
              rounded-lg border
              bg-alternative-200 text-foreground-light
              hover:text-foreground hover:border-foreground-muted
              focus-visible:text-foreground focus-visible:ring-2 focus-visible:outline-none
              focus-visible:rounded focus-visible:ring-foreground-lighter
            "
          >
            <div className="flex flex-col gap-1 !leading-3">
              <span>Features</span>
              <span className="text-foreground-lighter text-xs leading-4">
                Explore everything you can do with Supabase.
              </span>
            </div>
            <ChevronRight
              strokeWidth={2}
              className="w-3 -ml-1 transition-all will-change-transform -translate-x-1 opacity-80 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </Link>
        </>
      ) : menuItem.title === 'Developers' ? (
        <div className="px-3 mb-2 flex flex-col gap-6">
          {menuItem.subMenu['navigation'].map((column: any) => (
            <div key={column.label} className="flex flex-col gap-3">
              {column.label !== 'Developers' && (
                <label className="text-foreground-lighter text-xs uppercase tracking-widest font-mono">
                  {column.label}
                </label>
              )}
              {column.links.map((link: any) => (
                <TextLink
                  hasChevron={false}
                  key={link.text}
                  url={link.url}
                  label={link.text}
                  counter={link.text === 'Careers' && jobsCount > 0 ? jobsCount : undefined}
                  className="focus-visible:ring-offset-4 focus-visible:ring-offset-background-overlay !mt-0"
                />
              ))}
            </div>
          ))}

          <div className="flex flex-col py-2">
            <label className="text-foreground-lighter text-xs uppercase tracking-widest font-mono">
              Troubleshooting
            </label>
            <TextLink
              hasChevron={false}
              url={menuItem.subMenu['footer']['support'].url}
              label={menuItem.subMenu['footer']['support'].text}
              className="focus-visible:ring-offset-4 focus-visible:ring-offset-background-overlay"
            />
            <TextLink
              hasChevron={false}
              url={menuItem.subMenu['footer']['systemStatus'].url}
              label={menuItem.subMenu['footer']['systemStatus'].text}
              className="focus-visible:ring-offset-4 focus-visible:ring-offset-background-overlay"
            />
          </div>
        </div>
      ) : menuItem.title === 'Solutions' ? (
        <div className="px-3 mb-2 flex flex-col gap-6">
          {menuItem.subMenu['navigation'].map((column: any) => (
            <div key={column.label} className="flex flex-col gap-3">
              {column.label !== 'Solutions' && (
                <label className="text-foreground-lighter text-xs uppercase tracking-widest font-mono">
                  {column.label}
                </label>
              )}
              {column.links.map((link: any) => (
                <TextLink
                  hasChevron={false}
                  key={link.text}
                  url={link.url}
                  label={link.text}
                  className="focus-visible:ring-offset-4 focus-visible:ring-offset-background-overlay !mt-0"
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </>
  )

  const Menu = () => (
    <Accordion
      type="default"
      openBehaviour="multiple"
      size="large"
      className="space-y-1"
      justified
      chevronAlign="right"
    >
      {menu.primaryNav.map((menuItem: any) => (
        <m.div variants={listItem} className="border-b [&>div]:!rounded-none" key={menuItem.title}>
          {menuItem.hasDropdown ? (
            <Accordion.Item
              header={menuItem.title}
              id={menuItem.title}
              className="block relative py-2 pl-3 pr-4 text-base font-medium text-foreground hover:bg-surface-200"
            >
              <AccordionMenuItem menuItem={menuItem} />
            </Accordion.Item>
          ) : (
            <Link
              href={menuItem.url}
              className="block py-2 pl-3 pr-4 text-base font-medium text-foreground hover:bg-surface-200 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-foreground-lighter focus-visible:rounded"
            >
              {menuItem.title}
            </Link>
          )}
        </m.div>
      ))}
    </Accordion>
  )

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {open && (
          <m.div
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
            className="bg-overlay fixed overflow-hidden inset-0 z-50 h-screen max-h-screen w-screen supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh] transform"
          >
            <div className="absolute h-16 px-6 flex items-center justify-between w-screen left-0 top-0 z-50 bg-overlay before:content[''] before:absolute before:w-full before:h-3 before:inset-0 before:top-full before:bg-gradient-to-b before:from-background-overlay before:to-transparent">
              <Link
                href="/"
                as="/"
                className="block w-auto h-6 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-foreground-lighter focus-visible:ring-offset-4 focus-visible:ring-offset-background-alternative focus-visible:rounded-sm"
              >
                <Image
                  src={supabaseLogoWordmarkLight}
                  width={124}
                  height={24}
                  alt="Supabase Logo"
                  className="dark:hidden"
                  priority
                />
                <Image
                  src={supabaseLogoWordmarkDark}
                  width={124}
                  height={24}
                  alt="Supabase Logo"
                  className="hidden dark:block"
                  priority
                />
              </Link>
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground-lighter focus:ring-brand hover:text-foreground-light transition-colors focus:outline-none focus:ring-2 focus:ring-inset"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="max-h-screen supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh] overflow-y-auto pt-20 pb-32 px-4">
              <Menu />
            </div>
            <div className="absolute bottom-0 left-0 right-0 top-auto w-full bg-alternative flex items-stretch p-4 gap-4">
              {!isUserLoading && (
                <>
                  {isLoggedIn ? (
                    <Link href="/dashboard/projects" passHref legacyBehavior>
                      <Button block asChild>
                        <a type={undefined} className="h-10 py-4">
                          Dashboard
                        </a>
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="https://supabase.com/dashboard"
                        passHref
                        legacyBehavior
                        onClick={() =>
                          sendTelemetryEvent({
                            action: 'sign_in_button_clicked',
                            properties: { buttonLocation: 'Mobile Nav' },
                          })
                        }
                      >
                        <Button block type="default" asChild>
                          <a type={undefined} className="h-10 py-4">
                            Sign in
                          </a>
                        </Button>
                      </Link>
                      <Link
                        href="https://supabase.com/dashboard"
                        passHref
                        legacyBehavior
                        onClick={() =>
                          sendTelemetryEvent({
                            action: 'start_project_button_clicked',
                            properties: { buttonLocation: 'Mobile Nav' },
                          })
                        }
                      >
                        <Button block asChild>
                          <a type={undefined} className="h-10 py-4">
                            Start your project
                          </a>
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {open && (
          <m.div
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
            className="bg-alternative fixed overflow-hidden inset-0 z-40 h-screen w-screen transform"
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}

export default MobileMenu
