'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, Send, X } from 'lucide-react'

import type { GameState } from '@/types'

interface ManagerInputProps {
  managerNumber: number
  gameState: GameState
  onSubmitPlay: (managerNum: number, result: string) => void
}

export default function ManagerInput({ managerNumber, gameState, onSubmitPlay }: ManagerInputProps) {
  const [selectedResult, setSelectedResult] = useState('')
  
  const isSubmitted = managerNumber === 1 ? !!gameState.manager1Submission : !!gameState.manager2Submission
  const submission = managerNumber === 1 ? gameState.manager1Submission : gameState.manager2Submission

  const handleSubmit = () => {
    if (!selectedResult) {
      alert('Please select an at-bat result')
      return
    }
    onSubmitPlay(managerNumber, selectedResult)
  }

  const handleClear = () => {
    setSelectedResult('')
  }

  return (
    <Card className={managerNumber === 1 ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-red-500'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Manager {managerNumber} Input
          {isSubmitted && (
            <Badge variant="secondary" className="ml-auto">
              Submitted
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubmitted ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">At-Bat Result:</label>
              <Select value={selectedResult} onValueChange={setSelectedResult}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result..." />
                </SelectTrigger>
                <SelectContent>
                  {/* HITS */}
                  <optgroup label="HITS">
                    <SelectItem value="1B">Single (1B)</SelectItem>
                    <SelectItem value="2B">Double (2B)</SelectItem>
                    <SelectItem value="3B">Triple (3B)</SelectItem>
                    <SelectItem value="HR">Home Run (HR)</SelectItem>
                    <SelectItem value="1B+E">Single + Error</SelectItem>
                    <SelectItem value="2B+E">Double + Error</SelectItem>
                  </optgroup>
                  
                  {/* WALKS & HBP */}
                  <optgroup label="WALKS & HBP">
                    <SelectItem value="BB">Walk (BB)</SelectItem>
                    <SelectItem value="IBB">Intentional Walk (IBB)</SelectItem>
                    <SelectItem value="HBP">Hit By Pitch (HBP)</SelectItem>
                  </optgroup>
                  
                  {/* STRIKEOUTS */}
                  <optgroup label="STRIKEOUTS">
                    <SelectItem value="K">Strikeout Swinging (K)</SelectItem>
                    <SelectItem value="KC">Strikeout Looking (KC)</SelectItem>
                    <SelectItem value="KPB">Strikeout + Passed Ball</SelectItem>
                    <SelectItem value="KWP">Strikeout + Wild Pitch</SelectItem>
                  </optgroup>
                  
                  {/* GROUND OUTS */}
                  <optgroup label="GROUND OUTS">
                    <SelectItem value="1-3">Groundout P-1B (1-3)</SelectItem>
                    <SelectItem value="3-1">Groundout 1B-P (3-1)</SelectItem>
                    <SelectItem value="4-3">Groundout 2B-1B (4-3)</SelectItem>
                    <SelectItem value="5-3">Groundout 3B-1B (5-3)</SelectItem>
                    <SelectItem value="6-3">Groundout SS-1B (6-3)</SelectItem>
                    <SelectItem value="1U">Groundout P Unassisted (1U)</SelectItem>
                    <SelectItem value="3U">Groundout 1B Unassisted (3U)</SelectItem>
                  </optgroup>
                  
                  {/* FLY OUTS */}
                  <optgroup label="FLY OUTS">
                    <SelectItem value="F1">Flyout to Pitcher (F1)</SelectItem>
                    <SelectItem value="F2">Flyout to Catcher (F2)</SelectItem>
                    <SelectItem value="F3">Flyout to 1B (F3)</SelectItem>
                    <SelectItem value="F4">Flyout to 2B (F4)</SelectItem>
                    <SelectItem value="F5">Flyout to 3B (F5)</SelectItem>
                    <SelectItem value="F6">Flyout to SS (F6)</SelectItem>
                    <SelectItem value="F7">Flyout to LF (F7)</SelectItem>
                    <SelectItem value="F8">Flyout to CF (F8)</SelectItem>
                    <SelectItem value="F9">Flyout to RF (F9)</SelectItem>
                  </optgroup>
                  
                  {/* LINE OUTS */}
                  <optgroup label="LINE OUTS">
                    <SelectItem value="L1">Lineout to Pitcher (L1)</SelectItem>
                    <SelectItem value="L3">Lineout to 1B (L3)</SelectItem>
                    <SelectItem value="L4">Lineout to 2B (L4)</SelectItem>
                    <SelectItem value="L5">Lineout to 3B (L5)</SelectItem>
                    <SelectItem value="L6">Lineout to SS (L6)</SelectItem>
                    <SelectItem value="L7">Lineout to LF (L7)</SelectItem>
                    <SelectItem value="L8">Lineout to CF (L8)</SelectItem>
                    <SelectItem value="L9">Lineout to RF (L9)</SelectItem>
                  </optgroup>
                  
                  {/* ERRORS */}
                  <optgroup label="ERRORS">
                    <SelectItem value="E1">Error on Pitcher (E1)</SelectItem>
                    <SelectItem value="E2">Error on Catcher (E2)</SelectItem>
                    <SelectItem value="E3">Error on 1B (E3)</SelectItem>
                    <SelectItem value="E4">Error on 2B (E4)</SelectItem>
                    <SelectItem value="E5">Error on 3B (E5)</SelectItem>
                    <SelectItem value="E6">Error on SS (E6)</SelectItem>
                    <SelectItem value="E7">Error on LF (E7)</SelectItem>
                    <SelectItem value="E8">Error on CF (E8)</SelectItem>
                    <SelectItem value="E9">Error on RF (E9)</SelectItem>
                  </optgroup>

                  {/* SACRIFICE */}
                  <optgroup label="SACRIFICE">
                    <SelectItem value="SAC">Sacrifice Bunt (SAC)</SelectItem>
                    <SelectItem value="SF">Sacrifice Fly (SF)</SelectItem>
                    <SelectItem value="SF7">Sacrifice Fly LF (SF7)</SelectItem>
                    <SelectItem value="SF8">Sacrifice Fly CF (SF8)</SelectItem>
                    <SelectItem value="SF9">Sacrifice Fly RF (SF9)</SelectItem>
                  </optgroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Submit Play
              </Button>
              <Button onClick={handleClear} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">Submitted Result:</div>
              <div className="text-lg font-bold text-green-900">{submission?.result}</div>
              <div className="text-sm text-green-600">
                Submitted at {submission?.timestamp ? new Date(submission.timestamp).toLocaleTimeString() : ''}
              </div>
            </div>

            {gameState.manager1Submission && gameState.manager2Submission && 
             gameState.manager1Submission.result !== gameState.manager2Submission.result && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800">⚠️ Conflict Detected</div>
                <div className="text-sm text-red-600">
                  Manager inputs don't match. Commissioner review may be needed.
                </div>
              </div>
            )}

            <div className="text-sm text-slate-600">
              Waiting for {gameState.manager1Submission && gameState.manager2Submission ? 'processing...' : 'other manager...'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}