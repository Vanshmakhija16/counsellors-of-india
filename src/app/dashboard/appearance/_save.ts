      const { error } = await supabase
        .from('therapists')
        .update({
          template_id:     selectedTemplate,
          color_id:        selectedColor,
          hidden_sections: hiddenSections,
          profile_content: profileContent,
        })
        .eq('id', user.id)

      if (error) {
        const msg = error.message ?? error.details ?? error.hint ?? JSON.stringify(error)
        throw new Error(msg)
      }