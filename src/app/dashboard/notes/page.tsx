import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FileText, Clock } from 'lucide-react'

const notes = [
  { id: 1, client: 'Ananya Mehta',  date: '30 Apr 2025', excerpt: 'Discussed coping strategies for workplace anxiety. Progress noted in breathing exercises.' },
  { id: 2, client: 'Sneha Pillai',  date: '28 Apr 2025', excerpt: 'Session focused on family dynamics. Client expressed difficulty with boundary setting.' },
  { id: 3, client: 'Rohan Verma',   date: '25 Apr 2025', excerpt: 'First session. Intake completed. Goals identified around social anxiety and confidence.' },
]

export default function NotesPage() {
  return (
    // <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900"
                style={{ fontFamily: 'var(--font-cormorant), serif' }}>
              Session Notes
            </h1>
            <p className="text-gray-500 text-sm mt-1">Private notes visible only to you</p>
          </div>
          <Button>+ New Note</Button>
        </div>

        <div className="space-y-4">
          {notes.map(note => (
            <Card key={note.id} padding="md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{note.client}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Clock size={11} /> {note.date}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{note.excerpt}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">Edit</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    // {/* </DashboardLayout> */}
  )
}
